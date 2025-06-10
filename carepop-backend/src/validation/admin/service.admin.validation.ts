import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required.'),
  description: z.string().optional(),
  cost: z.number().min(0, 'Cost must be a positive number.').optional(),
  requirements: z.string().optional(),
  category_id: z.string().uuid('Invalid category ID.'),
  typical_duration_minutes: z.number().int().positive('Duration must be a positive integer.').optional(),
  is_active: z.boolean().optional().default(true),
});

export const updateServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required.').optional(),
  description: z.string().optional(),
  cost: z.number().min(0, 'Cost must be a positive number.').optional(),
  requirements: z.string().optional(),
  category_id: z.string().uuid('Invalid category ID.').optional(),
  typical_duration_minutes: z.number().int().positive('Duration must be a positive integer.').optional(),
  is_active: z.boolean().optional(),
}); 