import { z } from 'zod';

export const createServiceCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required.'),
  description: z.string().optional().transform(val => val ?? null),
});

export const updateServiceCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required.').optional(),
  description: z.string().optional().nullable(),
}); 