import { z } from 'zod';

// Schema for updating a user's profile.
// This schema should match the fields being sent from the complete-profile-form on the frontend.
export const updateProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  middle_initial: z.string().max(2).optional().nullable(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'DOB must be in YYYY-MM-DD format').nullable(),
  contact_no: z.string().optional().nullable(),
  gender_identity: z.string().min(1).optional().nullable(),
  pronouns: z.string().min(1).optional().nullable(),
  assigned_sex_at_birth: z.string().min(1).optional().nullable(),
  civil_status: z.string().min(1).optional().nullable(),
  religion: z.string().optional().nullable(),
  occupation: z.string().min(1).optional().nullable(),
  philhealth_no: z.string().optional().nullable(),
  street: z.string().min(1).optional().nullable(),
  province_code: z.string().min(1).optional().nullable(),
  city_municipality_code: z.string().min(1).optional().nullable(),
  barangay_code: z.string().min(1).optional().nullable(),
  // These are sent from the server action but not directly part of the profile table schema
  // We can choose to include or omit them based on whether the service needs them.
  // For now, we'll allow them to pass validation.
  age: z.number().optional().nullable(),
  profileComplete: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>; 