import { z } from 'zod';

// Base schema for the provider's body data on creation
export const createProviderBodySchema = z.object({
  firstName: z.string({ required_error: 'First name is required.' }).min(1, 'First name cannot be empty.'),
  lastName: z.string({ required_error: 'Last name is required.' }).min(1, 'Last name cannot be empty.'),
  email: z.string().email('Invalid email address.'),
  phoneNumber: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  // services are handled separately
});

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

// Type definitions inferred from schemas
export type CreateProviderBody = z.infer<typeof createProviderBodySchema>;
export type UpdateProviderBody = z.infer<typeof updateProviderBodySchema>;
export type ListProvidersQuery = z.infer<typeof listProvidersSchema.shape.query>;
export type ProviderIdParams = z.infer<typeof providerIdSchema.shape.params>; 