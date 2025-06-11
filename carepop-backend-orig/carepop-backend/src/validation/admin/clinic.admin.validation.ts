import { z } from 'zod';

export const createClinicSchema = z.object({
  name: z.string().min(1, "Clinic name is required"),
  full_address: z.string().optional().nullable(), // Added nullable based on typical DB patterns
  street_address: z.string().optional().nullable(), // Added nullable
  locality: z.string().optional().nullable(), // Added nullable
  region: z.string().optional().nullable(), // Added nullable
  postal_code: z.string().optional().nullable(), // Updated to nullable
  country_code: z.string().default('PH').optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(), // Added nullable
  longitude: z.number().min(-180).max(180).optional().nullable(), // Added nullable
  contact_phone: z.string().optional().nullable(), // Updated to nullable
  contact_email: z.string().email("Invalid email address").optional().nullable(), // Updated to nullable
  website_url: z.string().url("Invalid URL").optional().nullable(),
  operating_hours: z.string().optional().nullable(), // Correct from previous step
  services_offered: z.array(z.string()).optional().nullable(), // Updated to nullable
  fpop_chapter_affiliation: z.string().optional().nullable(), // Updated to nullable
  additional_notes: z.string().optional().nullable(), // Updated to nullable
  is_active: z.boolean().default(true).optional()
});

export type CreateClinicInput = z.infer<typeof createClinicSchema>;

// updateClinicSchema will correctly inherit these changes due to .partial()
export const updateClinicSchema = createClinicSchema.partial();
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