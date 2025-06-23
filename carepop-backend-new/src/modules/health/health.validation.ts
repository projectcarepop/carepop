import { z } from 'zod';

export const createHealthEntrySchema = z.object({
  entry_type: z.enum(['pill', 'mood', 'menstrual_cycle']),
  status: z.string().optional(),
  value: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  entry_date: z.string().datetime().optional(),
}); 