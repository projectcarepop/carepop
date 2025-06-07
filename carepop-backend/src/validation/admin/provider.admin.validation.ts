import { z } from 'zod';

// Base schema for the provider's body data on creation
export const createProviderBodySchema = z.object({
  first_name: z.string({ required_error: 'First name is required.' }).min(1, 'First name cannot be empty.'),
  last_name: z.string({ required_error: 'Last name is required.' }).min(1, 'Last name cannot be empty.'),
  email: z.string().email('Invalid email address.').optional(),
  contact_number: z.string().optional(),
  sex: z.string().optional(),
  birth_date: z.string().optional(), // Or z.date() if you handle conversion
  avatar_url: z.string().url('Invalid URL format.').optional(),
  is_active: z.boolean().default(true),
  accepting_new_patients: z.boolean().default(true),
});

// Schema for the entire create provider request
export const createProviderSchema = z.object({
  body: createProviderBodySchema,
});

export const updateProviderBodySchema = z.object({
  first_name: z.string().min(1, 'First name cannot be empty.').optional(),
  last_name: z.string().min(1, 'Last name cannot be empty.').optional(),
  email: z.string().email('Invalid email address.').optional(),
  contact_number: z.string().optional(),
  sex: z.string().optional(),
  birth_date: z.string().optional(),
  avatar_url: z.string().url('Invalid URL format.').optional(),
  is_active: z.boolean().optional(),
  accepting_new_patients: z.boolean().optional(),
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