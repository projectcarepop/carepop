import { z } from 'zod';

export const createReportBodySchema = z.object({
  reportContent: z.string().min(1, 'Report content is required'),
});

export const getReportsParamsSchema = z.object({
  appointmentId: z.string().uuid(),
});

export const updateReportParamsSchema = z.object({
  reportId: z.string().uuid(),
});

export const updateReportBodySchema = z.object({
  reportContent: z.string().min(1, 'Report content is required'),
}); 