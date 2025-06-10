import { z } from 'zod';
import { commonSchemas } from '../commonSchemas';

export const createServiceCategorySchema = z.object({
  name: commonSchemas.nonEmptyString,
  description: commonSchemas.optionalString,
});

export const updateServiceCategorySchema = createServiceCategorySchema.partial(); 