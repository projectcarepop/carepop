import { z } from 'zod';

export const serviceCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters long.'),
  description: z.string().optional(),
});

export type TServiceCategory = z.infer<typeof serviceCategorySchema>; 