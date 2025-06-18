'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const supplierFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact_person: z.string().optional().nullable(),
  contact_email: z.string().email('Invalid email address').optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  is_active: z.boolean(),
});

export async function createSupplier(values: z.infer<typeof supplierFormSchema>) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedData = supplierFormSchema.parse(values);
    const { error } = await supabase.from('suppliers').insert([validatedData]);
    if (error) return { success: false, message: `Failed to create supplier: ${error.message}` };
    revalidatePath('/admin/inventory');
    return { success: true, message: 'Supplier created successfully.' };
}

export async function updateSupplier(supplierId: string, values: z.infer<typeof supplierFormSchema>) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedData = supplierFormSchema.parse(values);
    const { error } = await supabase.from('suppliers').update(validatedData).eq('id', supplierId);
    if (error) return { success: false, message: `Failed to update supplier: ${error.message}` };
    revalidatePath('/admin/inventory');
    return { success: true, message: 'Supplier updated successfully.' };
}

export async function deleteSupplier(supplierId: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.from('suppliers').delete().eq('id', supplierId);
    if (error) {
        return { success: false, message: 'Failed to delete supplier. It may be linked to inventory items.' };
    }
    revalidatePath('/admin/inventory');
    return { success: true, message: 'Supplier deleted successfully.' };
}