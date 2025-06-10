import { z } from 'zod';
import { commonSchemas } from '../commonSchemas';

export const createProviderSchema = z.object({
  user_id: commonSchemas.uuid,
  first_name: commonSchemas.nonEmptyString,
  last_name: commonSchemas.nonEmptyString,
  email: z.string().email(),
  contact_number: commonSchemas.optionalString,
  sex: commonSchemas.optionalString,
  birth_date: z.string().date().optional().nullable(),
  is_active: z.boolean().default(true),
  accepting_new_patients: z.boolean().default(true),
});

export const updateProviderSchema = createProviderSchema.partial().omit({ user_id: true }); // Can't change the user_id 