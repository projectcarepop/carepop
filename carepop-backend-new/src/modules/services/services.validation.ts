import { z } from 'zod';

// Base schema for a service
const serviceBaseSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  description: z.string().optional().nullable(),
  // Price is a string for decimal fields in Drizzle
  price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Price must be a positive number",
  }),
  durationMinutes: z.coerce.number().int().positive('Duration must be a positive integer (in minutes)'),
  specializationId: z.string().uuid('Invalid specialization ID'),
  isActive: z.boolean().default(true),
});

// Schema for creating a new service
export const createServiceSchema = serviceBaseSchema;

// Schema for updating an existing service
export const updateServiceSchema = serviceBaseSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>; 