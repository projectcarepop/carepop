import { z } from 'zod';

export const createServiceCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

export const updateServiceCategorySchema = createServiceCategorySchema.partial();

export const serviceCategoryIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listServiceCategoriesQuerySchema = z.object({
    page: z.preprocess((val) => Number(val), z.number().int().min(1)).optional().default(1),
    limit: z.preprocess((val) => Number(val), z.number().int().min(1)).optional().default(10),
    search: z.string().optional(),
    sortBy: z.string().optional().default('name'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
}); 