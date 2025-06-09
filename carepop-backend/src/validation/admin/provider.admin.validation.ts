import { z } from 'zod';

// Schema for querying a list of providers
export const listProvidersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  searchTerm: z.string().optional(),
  isActive: z.preprocess(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }, z.boolean().optional()),
});

// Schemas for provider availability
const dayAvailabilitySchema = z.object({
    isActive: z.boolean(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
});

const weeklyAvailabilitySchema = z.object({
    monday: dayAvailabilitySchema,
    tuesday: dayAvailabilitySchema,
    wednesday: dayAvailabilitySchema,
    thursday: dayAvailabilitySchema,
    friday: dayAvailabilitySchema,
    saturday: dayAvailabilitySchema,
    sunday: dayAvailabilitySchema,
}).optional();

// Base schema for provider data
const providerBaseSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  services: z.array(z.string().uuid()).optional(),
  weeklyAvailability: weeklyAvailabilitySchema,
});

// Schema for creating a provider
export const createProviderBodySchema = providerBaseSchema.extend({
  isActive: z.boolean().optional().default(true),
});

// Schema for updating a provider (all fields are optional)
export const updateProviderBodySchema = providerBaseSchema.partial();

// Schema for validating the provider ID in URL params
export const providerIdParamSchema = z.object({
  id: z.string().uuid(),
});

// Export TypeScript types inferred from schemas
export type ListProvidersQuery = z.infer<typeof listProvidersQuerySchema>;
export type CreateProviderBody = z.infer<typeof createProviderBodySchema>;
export type UpdateProviderBody = z.infer<typeof updateProviderBodySchema>;
export type ProviderIdParam = z.infer<typeof providerIdParamSchema>;

// Schema for the entire create provider request
export const createProviderSchema = z.object({
  body: createProviderBodySchema,
});

export const updateProviderBodySchema = z.object({
  firstName: z.string().min(1, 'First name cannot be empty.').optional(),
  lastName: z.string().min(1, 'Last name cannot be empty.').optional(),
  email: z.string().email('Invalid email address.').optional(),
  phoneNumber: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  weeklyAvailability: z.object({
    monday: z.object({
      isActive: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
    }),
    tuesday: z.object({
      isActive: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
    }),
    wednesday: z.object({
      isActive: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
    }),
    thursday: z.object({
      isActive: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
    }),
    friday: z.object({
      isActive: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
    }),
    saturday: z.object({
      isActive: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
    }),
    sunday: z.object({
      isActive: z.boolean(),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format, expected HH:mm"),
    }),
  }).optional(),
});

export const listProvidersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(10),
    sortBy: z.enum(['last_name', 'first_name', 'created_at', 'updated_at']).optional().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
    searchTerm: z.string().optional(),
    isActive: z.preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }, z.boolean().optional()),
  }),
});

export const providerIdSchema = z.object({
  params: z.object({
    providerId: z.string().uuid('Invalid provider ID format'),
  }),
});

// Combined schema for update that includes path param for providerId
export const updateProviderSchema = z.object({
  body: updateProviderBodySchema,
  params: z.object({
    providerId: z.string().uuid('Invalid provider ID format'),
  }),
}); 