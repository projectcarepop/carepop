import { z } from 'zod';

// Schema for updating a user's profile.
// All fields are optional, as a user might only want to update one piece of information at a time.
export const updateProfileSchema = z.object({
  first_name: z.string().min(1, 'First name cannot be empty.').optional(),
  last_name: z.string().min(1, 'Last name cannot be empty.').optional(),
  phone_number: z.string().optional().nullable(),
  // We can add other fields here later, like avatar_url, date_of_birth, etc.
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>; 