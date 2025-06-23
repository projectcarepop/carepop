import { z } from 'zod';

// Base schema for a provider
const providerBaseSchema = z.object({
  profileId: z.string().uuid('Invalid profile ID'),
  licenseNumber: z.string().min(3, 'License number must be at least 3 characters long').optional().nullable(),
  bio: z.string().optional().nullable(),
  acceptingNewPatients: z.boolean().default(true),
});

// Schema for creating a new provider.
// This links an existing profile to a new provider record.
export const createProviderSchema = z.object({
  profileId: z.string().uuid({ message: 'A valid profile ID is required.' }),
  licenseNumber: z.string().min(3, { message: 'License number must be at least 3 characters.' }),
  bio: z.string().optional(),
  acceptingNewPatients: z.boolean().default(true),
});

// Schema for updating an existing provider.
// All fields are optional. Profile ID is not updatable.
export const updateProviderSchema = z.object({
  licenseNumber: z.string().min(3, { message: 'License number must be at least 3 characters.' }).optional(),
  bio: z.string().optional(),
  acceptingNewPatients: z.boolean().optional(),
});

export type CreateProviderInput = z.infer<typeof createProviderSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;

export const getProvidersForServiceSchema = z.object({
  clinicId: z.string().uuid('Invalid clinic ID format'),
  serviceId: z.string().uuid('Invalid service ID format'),
}); 