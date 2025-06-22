import { z } from 'zod';

export const ServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  price: z.number().optional(),
  durationMinutes: z.string().optional(),
  isActive: z.boolean(),
}); 