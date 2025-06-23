import { z } from 'zod';

export const getServicesForClinicSchema = z.object({
  clinicId: z.string().uuid(),
  serviceId: z.string().uuid('Invalid service ID format').optional(),
  specializationId: z.string().uuid('Invalid specialization ID format').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD').optional(),
});

export const getProviderAvailabilitySchema = z.object({
  providerId: z.string().uuid('Invalid provider ID format'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD'),
});

export const getAvailabilitySchema = z.object({
    clinicId: z.string().uuid(),
    serviceId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const getAdminAppointmentsSchema = z.object({
    clinicId: z.string().uuid('A valid clinic ID is required.'),
    page: z.coerce.number().int().min(1).default(1),
    per_page: z.coerce.number().int().min(1).max(100).default(10),
    sort: z.string().optional().default('startTime.desc'),
    searchTerm: z.string().optional(),
});

// Zod validation schemas for the booking module will be added here. 