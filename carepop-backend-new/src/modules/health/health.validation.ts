import { z } from 'zod';

const pillStatusEnum = z.enum(['taken', 'missed']);
const flowIntensityEnum = z.enum(['none', 'light', 'medium', 'heavy']);
const moodEnum = z.enum(['happy', 'neutral', 'sad', 'anxious', 'energetic']);

export const createHealthLogSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    pillStatus: pillStatusEnum.optional().nullable(),
    flowIntensity: flowIntensityEnum.optional().nullable(),
    symptoms: z.array(z.string()).optional().nullable(),
    mood: moodEnum.optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const getHealthLogsSchema = z.object({
  query: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
  }),
});

export const createHealthEntrySchema = z.object({
  entry_type: z.enum(['pill', 'mood', 'menstrual_cycle']),
  status: z.string().optional(),
  value: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  entry_date: z.string().datetime().optional(),
}); 