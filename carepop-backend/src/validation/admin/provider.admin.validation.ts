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
const providerBodyBaseSchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty.'),
  lastName: z.string().min(1, 'Last name cannot be empty.'),
  email: z.string().email('Invalid email address.'),
  phoneNumber: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  credentials: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  serviceIds: z.array(z.string().uuid()).optional(),
  weeklyAvailability: weeklyAvailabilitySchema.optional(),
});

// Schema for creating a provider
export const createProviderBodySchema = providerBodyBaseSchema.extend({
  isActive: z.boolean().optional().default(true),
});

// Schema for updating a provider (all fields are optional)
export const updateProviderBodySchema = providerBodyBaseSchema.partial();

// Schema for validating the provider ID in URL params
export const providerIdParamSchema = z.object({
  id: z.string().uuid('Invalid provider ID format'),
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