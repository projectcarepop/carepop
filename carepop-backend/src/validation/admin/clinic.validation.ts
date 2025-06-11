import { z } from 'zod';

export const createClinicSchema = z.object({
  name: z.string().min(1, "Clinic name is required"),
  full_address: z.string().min(1, "Full address is required"),
  street_address: z.string().optional(),
  locality: z.string().optional(), // city
  region: z.string().optional(), // province
  postal_code: z.string().optional(),
  country_code: z.string().optional().default('PH'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional().nullable(),
  website_url: z.string().url().optional().nullable(),
  operating_hours: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const updateClinicSchema = createClinicSchema.partial();

export const clinicIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listClinicsQuerySchema = z.object({
    page: z.preprocess((val) => Number(val), z.number().int().min(1)).optional().default(1),
    limit: z.preprocess((val) => Number(val), z.number().int().min(1)).optional().default(10),
    search: z.string().optional(),
    sortBy: z.string().optional().default('name'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
}); 