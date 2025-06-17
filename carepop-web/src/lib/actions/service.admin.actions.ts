'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const serviceFormSchema = z.object({
  name: z.string().min(2, { message: "Service name must be at least 2 characters." }),
  description: z.string().optional(),
  cost: z.coerce.number().min(0).optional(),
  typical_duration_minutes: z.coerce.number().int().positive().optional(),
  category_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean(),
});

export async function createService(values: z.infer<typeof serviceFormSchema>) {
    const supabase = createClient();
    const validatedData = serviceFormSchema.parse(values);

    const { error } = await supabase.from('services').insert([validatedData]);

    if (error) {
        console.error('Error creating service:', error);
        return { success: false, message: `Failed to create service: ${error.message}` };
    }

    revalidatePath('/admin/services');
    return { success: true, message: 'Service created successfully.' };
}

export async function updateService(serviceId: string, values: z.infer<typeof serviceFormSchema>) {
    const supabase = createClient();
    const validatedData = serviceFormSchema.parse(values);

    const { error } = await supabase.from('services').update(validatedData).eq('id', serviceId);
    
    if (error) {
        console.error('Error updating service:', error);
        return { success: false, message: `Failed to update service: ${error.message}` };
    }

    revalidatePath('/admin/services');
    revalidatePath(`/admin/services/${serviceId}/edit`);
    return { success: true, message: 'Service updated successfully.' };
}

export async function deleteService(serviceId: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

    if (error) {
        console.error('Error deleting service:', error);
        return { success: false, message: 'Failed to delete service.' };
    }

    revalidatePath('/admin/services');
    return { success: true, message: 'Service deleted successfully.' };
} 