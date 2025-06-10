import { z } from 'zod';

export const createAppointmentSchema = z.object({
  user_id: z.string().uuid(),
  service_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  appointment_datetime: z.string().datetime(),
  duration_minutes: z.number().int().positive(),
  status: z.enum(['Scheduled', 'Completed', 'Cancelled', 'No-Show']),
  notes_clinic: z.string().optional(),
});

export const updateAppointmentSchema = createAppointmentSchema.partial().omit({ user_id: true, service_id: true });

export const appointmentIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listAppointmentsQuerySchema = z.object({
    page: z.preprocess((val) => Number(val), z.number().int().min(1)).optional().default(1),
    limit: z.preprocess((val) => Number(val), z.number().int().min(1)).optional().default(10),
    search: z.string().optional(), // Will search user name or email
    clinic_id: z.string().uuid().optional(),
    provider_id: z.string().uuid().optional(),
    status: z.string().optional(),
    date_range_start: z.string().datetime().optional(),
    date_range_end: z.string().datetime().optional(),
    sortBy: z.string().optional().default('appointment_datetime'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
}); 