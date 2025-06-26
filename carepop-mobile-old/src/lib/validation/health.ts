import { z } from 'zod';

export const healthLogSchema = z.object({
  mood: z.string().min(1, 'Mood is required.'),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
});

export type HealthLogFormValues = z.infer<typeof healthLogSchema>; 