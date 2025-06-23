import { z } from 'zod';

// Base schema for common fields
const clinicBaseSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  streetAddress: z.string().optional().nullable(),
  locality: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  countryCode: z.string().default('PH'),
  contactPhone: z.string().optional().nullable(),
  contactEmail: z.string().email('Invalid email address').optional().nullable(),
  operationDays: z.array(z.string()).optional().nullable(),
  operationHours: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

// Schema for creating a new clinic
export const createClinicSchema = clinicBaseSchema;

// Schema for updating an existing clinic (all fields are optional)
export const updateClinicSchema = clinicBaseSchema.partial();

export type CreateClinicInput = z.infer<typeof createClinicSchema>;
export type UpdateClinicInput = z.infer<typeof updateClinicSchema>; 