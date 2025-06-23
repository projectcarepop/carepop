import { z } from 'zod';

export const getServicesForClinicSchema = z.object({
  clinicId: z.string().uuid('Invalid clinic ID format'),
});

export const getProviderAvailabilitySchema = z.object({
  providerId: z.string().uuid('Invalid provider ID format'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD'),
});

// Zod validation schemas for the booking module will be added here. 