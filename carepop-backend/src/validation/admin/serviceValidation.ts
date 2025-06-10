import { z } from 'zod';
import { commonSchemas } from '../commonSchemas';

export const createServiceSchema = z.object({
  name: commonSchemas.nonEmptyString,
  description: commonSchemas.optionalString,
  category_id: commonSchemas.uuid,
  cost: commonSchemas.nonNegativeNumber.optional().nullable(),
  typical_duration_minutes: commonSchemas.positiveInteger.optional().nullable(),
  requirements: commonSchemas.optionalString,
  is_active: z.boolean().default(true),
});

export const updateServiceSchema = createServiceSchema.partial(); 