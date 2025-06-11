import { z } from 'zod';

// Zod schema for clinic search query parameters
export const ClinicSearchQuerySchema = z.object({
  searchTerm: z.string().optional(), // For text-based search (name, address parts)
  latitude: z.coerce.number().optional(), // For location-based search
  longitude: z.coerce.number().optional(),// For location-based search
  radius: z.coerce.number().positive().optional(), // Search radius in meters
  // serviceIds: Can be a comma-separated string of UUIDs or an array of UUIDs.
  // Zod preprocess can handle string to array transformation.
  serviceIds: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        return val.split(',').map(id => id.trim()).filter(id => id);
      }
      if (Array.isArray(val)) {
        return val.map(id => String(id).trim()).filter(id => id);
      }
      return [];
    },
    z.array(z.string().uuid({ message: "Invalid Service ID format in serviceIds array" })).optional()
  ),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  // Add other filter parameters as needed, e.g., is_active, specific FPOP chapter, etc.
});

// TypeScript type for clinic search query parameters
export type ClinicSearchQuery = z.infer<typeof ClinicSearchQuerySchema>;

// Basic Clinic type - can be expanded based on what 'directoryService.searchClinics' returns
export interface ClinicSearchResult {
  id: string; // UUID
  name: string;
  address_line_1: string | null;
  address_line_2: string | null;
  barangay: string | null;
  city_municipality: string | null;
  province: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  contact_phone: string | null;
  contact_email: string | null;
  operating_hours: any | null; // JSONB - consider a more specific type if structure is known
  services_offered_names?: string[]; // Example: array of service names, if joined
  distance_km?: number; // If calculated by a geo-search
  // Add other relevant fields that the search might return
} 