'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { cookies } from 'next/headers';

const formSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, { message: "Service name must be at least 2 characters." }),
  description: z.string().optional().nullable(),
  cost: z.coerce.number().min(0).optional(),
  typical_duration_minutes: z.coerce.number().int().positive().optional(),
  category_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean(),
});

type ServiceFormValues = z.infer<typeof formSchema>;

export async function createService(values: ServiceFormValues) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const validatedData = formSchema.parse(values);

    const { error } = await supabase.from('services').insert([validatedData]);

    if (error) {
        console.error('Error creating service:', error);
        throw new Error(`Failed to create service: ${error.message}`);
    }

    revalidatePath('/admin/services');
    return { success: true, message: 'Service created successfully.' };
}

export async function updateService(values: ServiceFormValues) {
    console.log('Received values in server action:', values);
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const validatedData = formSchema.parse(values);
    const serviceId = validatedData.id;

    if (!serviceId) {
        throw new Error("Service ID is required for an update.");
    }

    // Manually construct the update object to avoid any potential issues with destructuring.
    const updateData = {
        name: validatedData.name,
        description: validatedData.description,
        cost: validatedData.cost,
        typical_duration_minutes: validatedData.typical_duration_minutes,
        category_id: validatedData.category_id,
        is_active: validatedData.is_active,
    };

    const { data, error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', serviceId)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating service:', error);
        throw new Error(`Failed to update service: ${error.message}`);
    }

    revalidatePath('/admin/services');
    revalidatePath(`/admin/services/${serviceId}`);
    return data;
}

export async function deleteService(serviceId: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.from('services').delete().eq('id', serviceId);

    if (error) {
        console.error('Error deleting service:', error);
        return { success: false, message: 'Failed to delete service.' };
    }

    revalidatePath('/admin/services');
    return { success: true, message: 'Service deleted successfully.' };
} 