'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

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
  itemId?: string;
}

export function InventoryItemForm({ itemId }: InventoryItemFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      item_name: '',
      is_active: true,
      quantity_on_hand: 0,
    },
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }
      
      const headers = { 'Authorization': `Bearer ${session.access_token}` };

      // Fetch suppliers
      const supplierRes = await fetch('/api/v1/admin/suppliers', { headers });
      if (supplierRes.ok) {
        const supData = await supplierRes.json();
        setSuppliers(supData.data);
      } else {
        setError('Failed to fetch suppliers.');
      }

      // Fetch item if editing
      if (itemId) {
        const itemRes = await fetch(`/api/v1/admin/inventory/${itemId}`, { headers });
        if (itemRes.ok) {
          const itemData = await itemRes.json();
          form.reset(itemData.data);
        } else {
          setError('Failed to fetch item data.');
        }
      }
      setLoading(false);
    };

    fetchInitialData();
  }, [itemId, supabase, form]);

  const onSubmit = async (values: ItemFormValues) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const url = itemId ? `/api/v1/admin/inventory/${itemId}` : '/api/v1/admin/inventory';
      const method = itemId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save item.');
      }

      toast.success(`Item has been successfully ${itemId ? 'updated' : 'created'}.`);
      router.refresh();
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading form...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{itemId ? 'Edit Item' : 'Create New Item'}</CardTitle>
        <CardDescription>
          {itemId ? 'Update the details of the inventory item.' : 'Fill in the details for the new item.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1 */}
            <div className="md:col-span-2 space-y-8">
              <FormField name="item_name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Biogesic 500mg" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <div className="grid grid-cols-2 gap-4">
                <FormField name="generic_name" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Generic Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Paracetamol" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField name="brand_name" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Biogesic" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField name="sku" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU / Barcode</FormLabel>
                    <FormControl><Input placeholder="e.g., 123456789" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField name="category" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl><Input placeholder="e.g., Analgesic" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField name="form" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form</FormLabel>
                    <FormControl><Input placeholder="e.g., Tablet" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                 <FormField name="strength_dosage" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strength/Dosage</FormLabel>
                    <FormControl><Input placeholder="e.g., 500mg" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                 <FormField name="packaging" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Packaging</FormLabel>
                    <FormControl><Input placeholder="e.g., Box of 100" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>
              <FormField name="storage_requirements" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Requirements</FormLabel>
                  <FormControl><Textarea placeholder="e.g., Store at room temperature away from direct sunlight." {...field} value={field.value ?? ''} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
            </div>

            {/* Column 2 */}
            <div className="space-y-8">
               <FormField name="supplier_id" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value ?? ''}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a supplier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">None</SelectItem>
                      {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}/>
              <div className="grid grid-cols-2 gap-4">
                <FormField name="purchase_cost" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Cost</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField name="selling_price" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
              </div>
               <div className="grid grid-cols-2 gap-4">
                <FormField name="quantity_on_hand" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qty On Hand</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField name="reorder_level" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Level</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
              </div>
              <FormField name="is_active" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <CardDescription>Inactive items cannot be sold.</CardDescription>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}/>
            </div>

            {/* Footer */}
            <div className="md:col-span-3">
              {error && <p className="text-sm font-medium text-destructive mb-4">{error}</p>}
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (itemId ? 'Save Changes' : 'Create Item')}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 