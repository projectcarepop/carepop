import { z } from 'zod';

export const createRecordBodySchema = z.object({
  recordTitle: z.string().min(1, 'Record title is required'),
  recordDetails: z.string().optional(),
});

export const getRecordsParamsSchema = z.object({
  userId: z.string().uuid(),
});

export const recordIdParamsSchema = z.object({
  recordId: z.string().uuid(),
});

export const updateRecordBodySchema = z.object({
    recordTitle: z.string().min(1, 'Record title is required'),
    recordDetails: z.string().optional(),
}); 