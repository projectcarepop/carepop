import { z } from 'zod';
import { commonSchemas } from '@/validation/commonSchemas';

const reportBodyBase = z.object({
  reportContent: z.string().min(1, 'Report content is required'),
});

export const createReportSchema = z.object({
  params: z.object({
    appointmentId: commonSchemas.uuid,
  }),
  body: reportBodyBase,
});

export const getReportsSchema = z.object({
  params: z.object({
    appointmentId: commonSchemas.uuid,
  }),
});

export const updateReportSchema = z.object({
  params: z.object({
    reportId: commonSchemas.uuid,
  }),
  body: reportBodyBase,
}); 