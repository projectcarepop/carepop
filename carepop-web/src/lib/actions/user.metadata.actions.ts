'use server';

import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

const profileFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  middle_initial: z.string().max(2, 'Max 2 characters').optional().nullable(),
  date_of_birth: z.coerce.date({ required_error: 'Date of birth is required' })
    .max(new Date(), { message: "Date of birth cannot be in the future." }),
  contact_no: z.string()
    .min(10, 'Must be a valid phone number')
    .regex(/^(09|\+639)\d{9}$/, { message: "Please enter a valid Philippine mobile number (e.g., 09xxxxxxxxx)." })
    .optional()
    .nullable(),
  gender_identity: z.string().min(1, 'Gender identity is required'),
  pronouns: z.string().min(1, 'Pronouns are required'),
  assigned_sex_at_birth: z.string().min(1, 'This field is required'),
  civil_status: z.string().min(1, 'Civil status is required'),
  religion: z.string().optional().nullable(),
  occupation: z.string().min(1, 'Occupation is required'),
  philhealth_no: z.string()
    .regex(/^\d{12}$/, { message: "PhilHealth number must be 12 digits."})
    .optional()
    .or(z.literal(''))
    .nullable(),
  street: z.string().min(1, 'Street address is required'),
  province_code: z.string({ required_error: "Province is required." }).min(1, 'Province is required'),
  city_municipality_code: z.string({ required_error: "City/Municipality is required." }).min(1, 'City/Municipality is required'),
  barangay_code: z.string({ required_error: "Barangay is required." }).min(1, 'Barangay is required'),
});

export type ProfileMetadataState = {
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
  success: boolean;
};

export async function updateUserMetadata(
  prevState: ProfileMetadataState,
  formData: FormData
): Promise<ProfileMetadataState> {
  const user = await currentUser();
  if (!user) {
    return {
      message: 'Authentication error: User not found.',
      success: false,
    };
  }

  const validatedFields = profileFormSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      message: 'Validation error: Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  try {
    const { first_name, last_name, ...metadata } = validatedFields.data;

    const dataToUpdate = {
      ...metadata,
      date_of_birth: metadata.date_of_birth.toISOString().split('T')[0], // format as YYYY-MM-DD
      profileComplete: true,
    };

    const clerkApi = await clerkClient();
    await clerkApi.users.updateUser(user.id, {
      firstName: first_name,
      lastName: last_name,
      publicMetadata: {
        ...user.publicMetadata,
        ...dataToUpdate,
      },
    });

    return { message: 'Welcome aboard! Your profile has been set up successfully.', success: true };
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return { message: 'An unexpected error occurred.', success: false };
  }
} 