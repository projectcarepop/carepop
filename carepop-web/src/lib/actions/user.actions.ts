'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// This is a more comprehensive schema for the multi-step form.
const profileFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  middle_initial: z.string().max(2, 'Max 2 characters').optional().nullable(),
  date_of_birth: z.coerce.date({ required_error: 'Date of birth is required' }),
  contact_no: z.string().min(10, 'Must be a valid contact number').optional().nullable(),
  gender_identity: z.string().min(1, 'Gender identity is required'),
  pronouns: z.string().min(1, 'Pronouns are required'),
  assigned_sex_at_birth: z.string().min(1, 'This field is required'),
  civil_status: z.string().min(1, 'Civil status is required'),
  religion: z.string().optional().nullable(),
  occupation: z.string().min(1, 'Occupation is required'),
  philhealth_no: z.string().optional().nullable(),
  street: z.string().min(1, 'Street address is required'),
  province_code: z.string().min(1, 'Province is required'),
  city_municipality_code: z.string().min(1, 'City/Municipality is required'),
  barangay_code: z.string().min(1, 'Barangay is required'),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export type ProfileFormState = {
    message: string;
    errors?: Partial<Record<keyof ProfileFormData | 'server', string[]>>;
    success: boolean;
};

export async function updateUserProfile(
    prevState: ProfileFormState,
    formData: FormData,
): Promise<ProfileFormState> {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return {
            message: 'Authentication error.',
            errors: { server: ['You must be logged in to update your profile.'] },
            success: false,
        };
    }

    const validatedFields = profileFormSchema.safeParse(
        Object.fromEntries(formData.entries()),
    );
    
    if (!validatedFields.success) {
        return {
            message: 'Invalid form data.',
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
        };
    }

    const { date_of_birth, ...rest } = validatedFields.data;
    const dataToUpdate = {
        ...rest,
        date_of_birth: date_of_birth.toISOString().split('T')[0],
    };

    // WORKAROUND: Cast to `any` to bypass the broken type generation
    const { error } = await (supabase.from('profiles') as any)
        .update(dataToUpdate)
        .eq('id', user.id);

    if (error) {
        console.error("Supabase profile update error: ", error);
        return {
            message: 'Database error.',
            errors: { server: ['Failed to update profile. Please try again.'] },
            success: false,
        };
    }

    revalidatePath('/dashboard');
    revalidatePath('/create-profile');
    
    return {
        message: 'Profile updated successfully!',
        errors: {},
        success: true,
    }
}