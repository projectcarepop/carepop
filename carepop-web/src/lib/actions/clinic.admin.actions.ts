'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const clinicFormSchema = z.object({
  name: z.string().min(2, { message: "Clinic name must be at least 2 characters." }),
  full_address: z.string().min(10, { message: "Please enter a complete address." }),
  contact_email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
  contact_phone: z.string().min(7, { message: "Please enter a valid phone number." }).optional().or(z.literal('')),
  operating_hours: z.string().optional(),
  is_active: z.boolean().default(true),
});

export async function createClinic(values: z.infer<typeof clinicFormSchema>) {
    const supabase = createClient();
    const validatedData = clinicFormSchema.parse(values);

    const { data, error } = await supabase
        .from('clinics')
        .insert([validatedData])
        .select()
        .single();
    
    if (error) {
        console.error('Error creating clinic:', error);
        return { success: false, message: `Failed to create clinic: ${error.message}` };
    }

    revalidatePath('/admin/clinics');
    // redirect is not used here to allow the client to show a toast
    return { success: true, message: 'Clinic created successfully.', data };
}


export async function updateClinic(clinicId: string, values: z.infer<typeof clinicFormSchema>) {
    const supabase = createClient();
    const validatedData = clinicFormSchema.parse(values);

    const { data, error } = await supabase
        .from('clinics')
        .update(validatedData)
        .eq('id', clinicId)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating clinic:', error);
        return { success: false, message: `Failed to update clinic: ${error.message}` };
    }

    revalidatePath('/admin/clinics');
    revalidatePath(`/admin/clinics/${clinicId}/edit`);
    return { success: true, message: 'Clinic updated successfully.', data };
}

export async function deleteClinic(clinicId: string) {
    const supabase = createClient();

    const { error } = await supabase
        .from('clinics')
        .delete()
        .eq('id', clinicId);

    if (error) {
        console.error('Error deleting clinic:', error);
        return { success: false, message: 'Failed to delete clinic.' };
    }

    revalidatePath('/admin/clinics');
    return { success: true, message: 'Clinic deleted successfully.' };
} 