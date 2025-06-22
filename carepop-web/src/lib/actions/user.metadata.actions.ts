'use server';

import { clerkClient, currentUser, auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const profileFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  middle_initial: z.string().max(2, 'Max 2 characters').optional().nullable(),
  birth_year: z.string({ required_error: 'Year is required' }),
  birth_month: z.string({ required_error: 'Month is required' }),
  birth_day: z.string({ required_error: 'Day is required' }),
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
    const { birth_day, birth_month, birth_year, ...profileData } = validatedFields.data;

    const dateOfBirthString = `${birth_year}-${birth_month}-${birth_day}`;
    
    const dob = new Date(dateOfBirthString);
    if (isNaN(dob.getTime()) || dob > new Date()) {
        return { message: 'Invalid date of birth provided.', success: false };
    }

    const age = new Date(new Date().getTime() - dob.getTime()).getUTCFullYear() - 1970;

    const dataForBackend = {
        ...profileData,
        date_of_birth: dob.toISOString().split('T')[0],
        age: age,
    };

    // Use a dedicated server-side environment variable, with a fallback for local development.
    const backendApiUrl = `${process.env.INTERNAL_API_BASE_URL || 'http://localhost:3000'}/api/v1/profiles`;
    
    // Get the auth token to pass to the backend
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
        return { message: 'Authentication token is missing. Cannot save profile.', success: false };
    }

    const response = await fetch(backendApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Pass the token to the backend
        },
        body: JSON.stringify(dataForBackend),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("Backend API error:", errorBody);
        return { message: `An error occurred while saving your profile: ${errorBody.message || response.statusText}`, success: false };
    }
    
    const clerkApi = await clerkClient();
    await clerkApi.users.updateUser(user.id, {
      firstName: dataForBackend.first_name,
      lastName: dataForBackend.last_name,
      publicMetadata: {
        ...user.publicMetadata,
        profileComplete: true,
      },
    });

    return { message: 'Welcome aboard! Your profile has been set up successfully.', success: true };
  } catch (error) {
    console.error('Error in updateUserMetadata action:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { message: errorMessage, success: false };
  }
} 