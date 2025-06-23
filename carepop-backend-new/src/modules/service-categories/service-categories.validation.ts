import { z } from 'zod';

// Base schema for a service category
const categoryBaseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

// Schema for creating a new category
export const createCategorySchema = categoryBaseSchema;

// Schema for updating an existing category
export const updateCategorySchema = categoryBaseSchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>; 