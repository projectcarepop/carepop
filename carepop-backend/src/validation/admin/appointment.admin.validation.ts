import { z } from 'zod';

export const listAppointmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z.enum(['appointment_datetime', 'created_at']).optional().default('appointment_datetime'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  userId: z.string().uuid().optional(),
  time_frame: z.enum(['upcoming', 'past']).optional(),
});

export const appointmentIdParamSchema = z.object({
    appointmentId: z.string().uuid(),
});

export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
export type AppointmentIdParam = z.infer<typeof appointmentIdParamSchema>; 