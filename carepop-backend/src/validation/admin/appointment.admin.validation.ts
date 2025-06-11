import { z } from 'zod';
import { commonSchemas } from '../commonSchemas';

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

// Define the possible statuses for an appointment
export const appointmentStatusEnum = z.enum([
    'Scheduled', 
    'Completed', 
    'Cancelled', 
    'No-show'
]);

export const updateAppointmentSchema = z.object({
  status: appointmentStatusEnum.optional(),
  notes_clinic: commonSchemas.optionalString, // Admin/clinic internal notes
});

export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;
export type AppointmentIdParam = z.infer<typeof appointmentIdParamSchema>; 