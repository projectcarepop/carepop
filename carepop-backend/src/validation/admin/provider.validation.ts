import { z } from 'zod';

export const createProviderSchema = z.object({
  user_id: z.string().uuid().optional().nullable(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().nullable(),
  contact_number: z.string().optional(),
  sex: z.string().optional(),
  birth_date: z.string().optional(),
  avatar_url: z.string().url().optional().nullable(),
  accepting_new_patients: z.boolean().default(true),
  is_active: z.boolean().default(true),
  // Note: specialties, services, facilities, and schedules will be managed via separate endpoints
});

export const updateProviderSchema = createProviderSchema.partial();

export const providerIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listProvidersQuerySchema = z.object({
    page: z.preprocess((val) => Number(val), z.number().int().min(1)).optional().default(1),
    limit: z.preprocess((val) => Number(val), z.number().int().min(1)).optional().default(10),
    search: z.string().optional(),
    sortBy: z.string().optional().default('last_name'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
}); 