'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { createSupplier, updateSupplier } from '@/lib/actions/supplier.admin.actions';

const supplierFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact_person: z.string().optional().nullable(),
  contact_email: z.string().email('Invalid email address').optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  is_active: z.boolean(),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

interface SupplierFormProps {
  initialData?: SupplierFormValues & { id: string };
}

export function SupplierForm({ initialData }: SupplierFormProps) {
  const router = useRouter();
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: initialData || {
      name: '',
      contact_person: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      is_active: true,
    },
  });

  const isEditing = !!initialData;

  const onSubmit = async (values: SupplierFormValues) => {
    try {
      const result = isEditing
        ? await updateSupplier(initialData.id, values)
        : await createSupplier(values);

      if (!result.success) {
        throw new Error(result.message);
      }
      
      toast.success(result.message);
      router.push('/admin/inventory?tab=suppliers');
      router.refresh();

    } catch (err) {
        const message = err instanceof Error ? err.message : 'An unknown error occurred';
        toast.error(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Supplier' : 'Create New Supplier'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update the details of the supplier.' : 'Fill in the details for the new supplier.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Supplier Name</FormLabel><FormControl><Input placeholder="e.g., Pharma Inc." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="contact_person" render={({ field }) => (
                <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="contact_email" render={({ field }) => (
                <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input type="email" placeholder="e.g., contact@pharma.inc" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="contact_phone" render={({ field }) => (
                <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="e.g., +1 234 567 890" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="e.g., 123 Health St, Wellness City" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="is_active" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5"><FormLabel>Active Status</FormLabel></div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange}/></FormControl>
                </FormItem>
            )}/>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Supplier'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}