import { z } from 'zod';

// Schema for creating a new clinic
export const createClinicSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  is_active: z.boolean().default(true),
  street_address: z.string().optional(),
  locality: z.string().optional(),
  region: z.string().optional(),
  postal_code: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  operation_days: z.array(z.string()).optional(),
  operation_hours: z.string().optional(),
  fpop_chapter_affiliation: z.string().optional(),
  additional_notes: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

export type CreateClinicInput = z.infer<typeof createClinicSchema>;

// Schema for updating an existing clinic - all fields are optional
export const updateClinicSchema = createClinicSchema.partial();

export type UpdateClinicInput = z.infer<typeof updateClinicSchema>; 