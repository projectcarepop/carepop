'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const providerFormSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  credentials: z.string().optional(),
  bio: z.string().optional(),
  isActive: z.boolean().default(true),
  serviceIds: z.array(z.string()).optional(),
  weeklyAvailability: z.any().optional(), // Using any for now, can be refined with a specific schema
  avatarFile: z.any().optional(), // For file upload
  avatarUrl: z.string().url().optional().nullable(),
});


// Note: This is a simplified create action. 
// A real-world scenario would involve creating a user in auth.users as well.
export async function createProvider(formData: FormData) {
    const supabase = createClient();
    const values = Object.fromEntries(formData.entries());

    // TODO: Add proper validation logic here before parsing
    const validatedData = providerFormSchema.parse({
        ...values,
        isActive: values.isActive === 'true',
        serviceIds: formData.getAll('serviceIds'),
        // avatarFile is handled separately
    });
    
    let avatarUrl = validatedData.avatarUrl;
    const avatarFile = formData.get('avatarFile') as File;

    if (avatarFile && avatarFile.size > 0) {
        const fileName = `${Date.now()}-${avatarFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(`providers/${fileName}`, avatarFile);

        if (uploadError) {
            console.error("Avatar Upload Failed:", uploadError);
            return { success: false, message: `Avatar Upload Failed: ${uploadError.message}` };
        }
        
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
        avatarUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('providers').insert([{ 
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        contact_number: validatedData.phoneNumber,
        specialization: validatedData.specialization,
        license_number: validatedData.licenseNumber,
        credentials: validatedData.credentials,
        bio: validatedData.bio,
        is_active: validatedData.isActive,
        avatar_url: avatarUrl
        // TODO: We need to associate this provider with a user_id
    }]);

    if (error) {
        console.error('Error creating provider:', error);
        return { success: false, message: `Failed to create provider: ${error.message}` };
    }

    revalidatePath('/admin/providers');
    return { success: true, message: 'Provider created successfully.' };
}

export async function updateProvider(providerId: string, formData: FormData) {
    const supabase = createClient();
    const values = Object.fromEntries(formData.entries());
    
     const validatedData = providerFormSchema.parse({
        ...values,
        isActive: values.isActive === 'true',
        serviceIds: formData.getAll('serviceIds'),
    });
    
    let avatarUrl = validatedData.avatarUrl;
    const avatarFile = formData.get('avatarFile') as File;

    if (avatarFile && avatarFile.size > 0) {
        const fileName = `${Date.now()}-${avatarFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(`providers/${fileName}`, avatarFile, { upsert: true });

        if (uploadError) {
            return { success: false, message: `Avatar Upload Failed: ${uploadError.message}` };
        }
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
        avatarUrl = urlData.publicUrl;
    }

     const { error } = await supabase.from('providers').update({ 
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        contact_number: validatedData.phoneNumber,
        specialization: validatedData.specialization,
        license_number: validatedData.licenseNumber,
        credentials: validatedData.credentials,
        bio: validatedData.bio,
        is_active: validatedData.isActive,
        avatar_url: avatarUrl
    }).eq('id', providerId);


    if (error) {
        console.error('Error updating provider:', error);
        return { success: false, message: `Failed to update provider: ${error.message}` };
    }

    revalidatePath('/admin/providers');
    revalidatePath(`/admin/providers/${providerId}/edit`);
    return { success: true, message: 'Provider updated successfully.' };
}


export async function deleteProvider(providerId: string) {
    const supabase = createClient();

    // TODO: We need to decide on the cascade behavior.
    // Does deleting a provider also delete their user record in auth.users?
    // For now, we only delete from the 'providers' table.
    
    const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', providerId);

    if (error) {
        console.error('Error deleting provider:', error);
        return { success: false, message: 'Failed to delete provider.' };
    }

    revalidatePath('/admin/providers');
    return { success: true, message: 'Provider deleted successfully.' };
} 