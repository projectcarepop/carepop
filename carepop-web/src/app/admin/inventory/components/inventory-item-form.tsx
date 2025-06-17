'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { createInventoryItem, updateInventoryItem } from '@/lib/actions/inventory-item.admin.actions';

const itemFormSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  generic_name: z.string().optional().nullable(),
  brand_name: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  form: z.string().optional().nullable(),
  strength_dosage: z.string().optional().nullable(),
  packaging: z.string().optional().nullable(),
  quantity_on_hand: z.coerce.number().int().min(0),
  reorder_level: z.coerce.number().int().min(0).optional().nullable(),
  purchase_cost: z.coerce.number().min(0).optional().nullable(),
  selling_price: z.coerce.number().min(0).optional().nullable(),
  supplier_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean(),
  storage_requirements: z.string().optional().nullable(),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ISupplier {
  id: string;
  name: string;
}

interface InventoryItemFormProps {
  initialData?: ItemFormValues & { id: string };
  suppliers: ISupplier[];
}

export function InventoryItemForm({ initialData, suppliers }: InventoryItemFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: initialData || {
      item_name: '',
      is_active: true,
      quantity_on_hand: 0,
    },
  });

  const isEditing = !!initialData;

  const onSubmit = async (values: ItemFormValues) => {
    try {
      const result = isEditing
        ? await updateInventoryItem(initialData.id, values)
        : await createInventoryItem(values);

      if (!result.success) {
        throw new Error(result.message);
      }

      toast({ title: 'Success', description: result.message });
      router.push('/admin/inventory?tab=items');
      router.refresh();
    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Item' : 'Create New Item'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update the details of the inventory item.' : 'Fill in the details for the new item.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1 */}
            <div className="md:col-span-2 space-y-8">
              <FormField name="item_name" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Item Name</FormLabel><FormControl><Input placeholder="e.g., Biogesic 500mg" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <div className="grid grid-cols-2 gap-4">
                <FormField name="generic_name" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Generic Name</FormLabel><FormControl><Input placeholder="e.g., Paracetamol" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField name="brand_name" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Brand Name</FormLabel><FormControl><Input placeholder="e.g., Biogesic" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField name="sku" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>SKU / Barcode</FormLabel><FormControl><Input placeholder="e.g., 123456789" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField name="category" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Analgesic" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField name="form" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Form</FormLabel><FormControl><Input placeholder="e.g., Tablet" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField name="strength_dosage" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Strength/Dosage</FormLabel><FormControl><Input placeholder="e.g., 500mg" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField name="packaging" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Packaging</FormLabel><FormControl><Input placeholder="e.g., Box of 100" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
              <FormField name="storage_requirements" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Storage Requirements</FormLabel><FormControl><Textarea placeholder="e.g., Store at room temperature away from direct sunlight." {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>

            {/* Column 2 */}
            <div className="space-y-8">
               <FormField name="supplier_id" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? ''}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a supplier" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
              <div className="grid grid-cols-2 gap-4">
                <FormField name="purchase_cost" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Purchase Cost</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField name="selling_price" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Selling Price</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                  )}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField name="quantity_on_hand" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField name="reorder_level" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Reorder Level</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
              <FormField name="is_active" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5"><FormLabel>Active</FormLabel></div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}/>
            </div>
            
            <div className="md:col-span-3 flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Item')}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}