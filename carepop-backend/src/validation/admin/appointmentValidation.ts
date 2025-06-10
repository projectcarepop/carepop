import { z } from 'zod';
import { commonSchemas } from '../commonSchemas';

// Define the possible statuses for an appointment
const appointmentStatusEnum = z.enum([
    'Scheduled', 
    'Completed', 
    'Cancelled', 
    'No-show'
]);

export const updateAppointmentSchema = z.object({
  status: appointmentStatusEnum.optional(),
  notes_clinic: commonSchemas.optionalString, // Admin/clinic internal notes
}); 