import { z } from 'zod';

// Helper for operating hours if you want a specific structure, e.g., for each day
const operatingHoursSchema = z.record(
  z.string(), // Day of week e.g., "monday", "tuesday"
  z.object({
    open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format, HH:MM expected"), // HH:MM format
    close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format, HH:MM expected"),
    notes: z.string().optional()
  }).optional()
);

export const createClinicSchema = z.object({
  name: z.string().min(1, "Clinic name is required"),
  full_address: z.string().optional(), // Used for geocoding if lat/lng not provided
  street_address: z.string().optional(),
  locality: z.string().optional(), // e.g., City or Municipality
  region: z.string().optional(), // e.g., Province or Metro Manila
  postal_code: z.string().optional(),
  country_code: z.string().default('PH').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email("Invalid email address").optional(),
  website_url: z.string().url("Invalid URL").optional().nullable(),
  operating_hours: z.preprocess((val) => {
    if (val === null || val === undefined) return val; // Pass through null or undefined
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        // Ensure the parsed value is an object, not a primitive if JSON string was e.g. '"string_literal"'
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
        return val; // Return original string if parsed value is not an object, to let Zod handle it
      } catch (e) {
        // If JSON.parse fails, return the original string to let Zod validation fail as expected
        return val;
      }
    }
    // If it's already an object (or anything else not a string), pass it through
    return val;
  }, operatingHoursSchema).optional().nullable(), // JSONB in DB
  services_offered: z.array(z.string()).optional(), // TEXT[] in DB
  fpop_chapter_affiliation: z.string().optional(),
  additional_notes: z.string().optional(),
  is_active: z.boolean().default(true).optional()
});

export type CreateClinicInput = z.infer<typeof createClinicSchema>;

// We can add schemas for update, list queries etc. here later
export const updateClinicSchema = createClinicSchema.partial(); // Allows all fields to be optional for PATCH-like updates
export type UpdateClinicInput = z.infer<typeof updateClinicSchema>;

export const clinicIdParamSchema = z.object({
  clinicId: z.string().uuid("Invalid clinic ID format")
});
export type ClinicIdParam = z.infer<typeof clinicIdParamSchema>;

// Schema for validating listClinics query parameters
export const listClinicsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10), // Max 100 items per page
  isActive: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined; // Or keep as is if not 'true' or 'false', letting Zod handle non-boolean if needed
  }, z.boolean().optional()),
  sortBy: z.string().optional().default('name'), // Default sort by name
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'), // Default sort order ascending
  searchByName: z.string().optional(), // Example for a future search filter
});

export type ListClinicsQueryInput = z.infer<typeof listClinicsQuerySchema>; 