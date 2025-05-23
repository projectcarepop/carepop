import { z } from 'zod';

// Zod schema for the GET /api/v1/services query parameters
export const GetServicesQuerySchema = z.object({
  category: z.string().optional(),
});

// TypeScript type for the query parameters, inferred from the Zod schema
export type GetServicesQuery = z.infer<typeof GetServicesQuerySchema>;

// Zod schema for the GET /api/v1/clinics/:clinicId/services path parameters
export const GetClinicServicesPathParamsSchema = z.object({
  clinicId: z.string().uuid({ message: "Invalid Clinic ID format" }),
});

// TypeScript type for the path parameters
export type GetClinicServicesPathParams = z.infer<typeof GetClinicServicesPathParamsSchema>;

// TypeScript type for a service object, based on the public.services table
// (Assuming standard created_at and updated_at fields)
export interface Service {
  id: string; // UUID
  name: string;
  description: string | null;
  category: string | null;
  typical_duration_minutes: number | null;
  requires_provider_assignment: boolean | null;
  additional_details: Record<string, any> | null; // JSONB
  is_active: boolean;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// TypeScript type for a service offered by a specific clinic,
// potentially including clinic-specific pricing from the clinic_services table.
export interface ClinicService extends Service {
  clinic_specific_price?: number | null; // From clinic_services table
  // Add other clinic-specific service details if needed from clinic_services table
  // For example, if clinic_services had its own is_offered_at_clinic boolean separate from service.is_active
} 