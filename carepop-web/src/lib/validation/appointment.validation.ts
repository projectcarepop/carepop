import { z } from 'zod';

export const appointmentSearchSchema = z.object({
  page: z.coerce.number().optional().default(1),
  per_page: z.coerce.number().optional().default(10),
  sort: z.string().optional().default('appointment_datetime.desc'),
  searchTerm: z.string().optional(),
  clinicId: z.string().uuid().optional(),
});