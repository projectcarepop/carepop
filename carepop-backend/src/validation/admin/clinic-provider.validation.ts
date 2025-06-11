import { z } from 'zod';
import { commonSchemas } from '@/validation/commonSchemas';

// Schema for validating path parameters when dealing with a specific clinic
export const clinicIdParamSchema = z.object({
  clinicId: z.string().uuid("Invalid clinic ID format"),
});
export type ClinicIdParam = z.infer<typeof clinicIdParamSchema>;

// Schema for validating path parameters when dealing with a specific provider at a clinic
export const clinicProviderPathParamsSchema = z.object({
  clinicId: z.string().uuid("Invalid clinic ID format"),
  providerId: z.string().uuid("Invalid provider ID format"),
});
export type ClinicProviderPathParams = z.infer<typeof clinicProviderPathParamsSchema>;

// Schema for the request body when associating a provider with a clinic
export const associateProviderBodySchema = z.object({
  providerId: z.string().uuid("Provider ID is required and must be a valid UUID"),
});
export type AssociateProviderBody = z.infer<typeof associateProviderBodySchema>;

// Schema for query parameters when listing providers for a clinic (e.g., pagination)
export const listProvidersForClinicQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  // Add other relevant query params like isActive for providers if needed
});
export type ListProvidersForClinicQuery = z.infer<typeof listProvidersForClinicQuerySchema>;

// Basic provider details for listing (can be expanded)
// This should align with what the providers table offers and what's useful for an admin list.
export const providerBasicDetailsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable().optional(),
  first_name: z.string(),
  last_name: z.string(),
  credentials: z.string().nullable().optional(),
  contact_email: z.string().email().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  is_active: z.boolean(),
  // We might also want to include when the association was created from provider_facilities
  // associated_at: z.date().optional(), // If provider_facilities has created_at
});
export type ProviderBasicDetails = z.infer<typeof providerBasicDetailsSchema>;

export const listProvidersForClinicResponseSchema = z.object({
  message: z.string(),
  data: z.array(providerBasicDetailsSchema),
  meta: z.object({
    totalItems: z.number(),
    totalPages: z.number(),
    currentPage: z.number(),
    itemsPerPage: z.number(),
  }),
});
export type ListProvidersForClinicResponse = z.infer<typeof listProvidersForClinicResponseSchema>;

// Response for successful association or disassociation could be simple
export const clinicProviderAssociationSuccessResponseSchema = z.object({
  message: z.string(),
  // Optionally return the association details or the provider details
  // data: z.object({ clinicId: z.string().uuid(), providerId: z.string().uuid() }).optional(),
});
export type ClinicProviderAssociationSuccessResponse = z.infer<typeof clinicProviderAssociationSuccessResponseSchema>;

export const listProvidersForClinicSchema = z.object({
  params: z.object({
    clinicId: commonSchemas.uuid,
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  }),
});

export const associateProviderSchema = z.object({
  params: z.object({
    clinicId: commonSchemas.uuid,
  }),
  body: z.object({
    providerId: commonSchemas.uuid,
  }),
});

export const disassociateProviderSchema = z.object({
  params: z.object({
    clinicId: commonSchemas.uuid,
    providerId: commonSchemas.uuid,
  }),
}); 