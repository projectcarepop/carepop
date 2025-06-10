import { z } from 'zod';
import { commonSchemas } from '../commonSchemas';

// Schema for what an admin can update on a user's profile/role
export const updateUserSchema = z.object({
  // From profiles table
  first_name: commonSchemas.nonEmptyString.optional(),
  last_name: commonSchemas.nonEmptyString.optional(),
  phone_number: commonSchemas.optionalString,
  // From user_roles table
  roles: z.array(z.string()).optional(), // e.g., ['user', 'provider', 'admin']
}); 