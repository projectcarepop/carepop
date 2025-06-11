import { z } from 'zod';

// Schema for querying a list of providers
export const listProvidersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.enum(['last_name', 'first_name', 'created_at', 'updated_at']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  searchTerm: z.string().optional(),
  isActive: z.preprocess(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }, z.boolean().optional()),
});

// New schemas for provider availability to match the frontend
const timeSlotSchema = z.object({
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
});

const weeklyAvailabilitySchema = z.array(z.object({
    day: z.string(),
    slots: z.array(timeSlotSchema),
}));

// Base schema for provider data, used for both create and update
export const providerBodyBaseSchema = z.object({
  user_id: z.string().uuid('Invalid user ID format'),
  first_name: z.string().min(1, 'First name cannot be empty.'),
  last_name: z.string().min(1, 'Last name cannot be empty.'),
  email: z.string().email('Invalid email address.'),
  contact_number: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
  accepting_new_patients: z.boolean().optional(),
  sex: z.string().optional().nullable(),
  birth_date: z.string().date().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  weekly_availability: weeklyAvailabilitySchema.optional(),
});

// Schema for creating a provider
export const createProviderBodySchema = providerBodyBaseSchema.extend({
  is_active: z.boolean().optional().default(true),
  accepting_new_patients: z.boolean().optional().default(true),
});

// Schema for updating a provider (all fields are optional)
export const updateProviderBodySchema = providerBodyBaseSchema.partial().omit({ user_id: true });

// Schema for validating the provider ID in URL params
export const providerIdParamSchema = z.object({
  providerId: z.string().uuid('Invalid provider ID format'),
});

// Export TypeScript types inferred from schemas
export type ListProvidersQuery = z.infer<typeof listProvidersQuerySchema>;
export type CreateProviderBody = z.infer<typeof createProviderBodySchema>;
export type UpdateProviderBody = z.infer<typeof updateProviderBodySchema>;
export type ProviderIdParam = z.infer<typeof providerIdParamSchema>;

// Combined schema for create request
export const createProviderSchema = z.object({
  body: createProviderBodySchema,
});

// Combined schema for update request
export const updateProviderSchema = z.object({
  body: updateProviderBodySchema,
  params: providerIdParamSchema,
}); 