import { z } from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  category_id: z.string().uuid("Invalid category ID"),
  cost: z.number().min(0).optional(),
  typical_duration_minutes: z.number().int().min(0).optional(),
  requires_provider_assignment: z.boolean().default(true),
  requirements: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const updateServiceSchema = createServiceSchema.partial();

export const serviceIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listServicesQuerySchema = z.object({
    page: z.preprocess((val) => Number(val), z.number().int().min(1)).optional().default(1),
    limit: z.preprocess((val) => Number(val), z.number().int().min(1)).optional().default(10),
    search: z.string().optional(),
    category_id: z.string().uuid().optional(),
    sortBy: z.string().optional().default('name'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
}); 