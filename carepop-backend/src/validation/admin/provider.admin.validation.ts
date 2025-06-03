import { z } from 'zod';

export const createProviderBodySchema = z.object({
  userId: z.string().uuid().optional().nullable(), // If linking to an existing auth.users
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
  // services: z.array(z.string().uuid()).optional(), // Array of service IDs to associate
});

export const updateProviderBodySchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  phoneNumber: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  // services: z.array(z.string().uuid()).optional(),
});

export const listProvidersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(10),
    sortBy: z.enum(['lastName', 'firstName', 'createdAt', 'updatedAt']).optional().default('createdAt'),
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

// Schema for create (only body)
export const createProviderSchema = z.object({
  body: createProviderBodySchema,
});

// Type definitions inferred from schemas
export type CreateProviderBody = z.infer<typeof createProviderBodySchema>;
export type UpdateProviderBody = z.infer<typeof updateProviderBodySchema>;
export type ListProvidersQuery = z.infer<typeof listProvidersSchema.shape.query>;
export type ProviderIdParams = z.infer<typeof providerIdSchema.shape.params>; 