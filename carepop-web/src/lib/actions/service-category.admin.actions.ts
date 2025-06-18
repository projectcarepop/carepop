'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { cookies } from 'next/headers';

const formSchema = z.object({
  name: z.string().min(1, { message: "Category name is required." }),
  description: z.string().optional().nullable(),
});

export async function createServiceCategory(values: z.infer<typeof formSchema>) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedData = formSchema.parse(values);

    const { error } = await supabase.from('service_categories').insert([validatedData]);

    if (error) {
        console.error('Error creating service category:', error);
        return { success: false, message: `Failed to create category: ${error.message}` };
    }

    revalidatePath('/admin/service-categories');
    return { success: true, message: 'Category created successfully.' };
}

export async function updateServiceCategory(categoryId: string, values: z.infer<typeof formSchema>) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const validatedData = formSchema.parse(values);

    const { error } = await supabase.from('service_categories').update(validatedData).eq('id', categoryId);
    
    if (error) {
        console.error('Error updating service category:', error);
        return { success: false, message: `Failed to update category: ${error.message}` };
    }

    revalidatePath('/admin/service-categories');
    revalidatePath(`/admin/service-categories/${categoryId}/edit`);
    return { success: true, message: 'Category updated successfully.' };
}

export async function deleteServiceCategory(categoryId: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
        .from('service_categories')
        .delete()
        .eq('id', categoryId);

    if (error) {
        console.error('Error deleting service category:', error);
        // A more specific error could be returned if, for example, a category cannot be deleted due to existing services.
        // This would require checking the `services` table first. For now, a generic error is fine.
        return { success: false, message: 'Failed to delete service category. It may still be in use.' };
    }

    revalidatePath('/admin/service-categories');
    return { success: true, message: 'Service category deleted successfully.' };
} 