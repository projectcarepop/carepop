import { z } from 'zod';
import { commonSchemas } from '@/validation/commonSchemas';

const recordBodyBase = z.object({
  recordTitle: z.string().min(1, 'Record title is required'),
  recordDetails: z.string().optional(),
});

export const createMedicalRecordSchema = z.object({
  params: z.object({
    userId: commonSchemas.uuid,
  }),
  body: recordBodyBase,
});

export const getMedicalRecordsSchema = z.object({
  params: z.object({
    userId: commonSchemas.uuid,
  }),
});

export const updateMedicalRecordSchema = z.object({
  params: z.object({
    recordId: commonSchemas.uuid,
  }),
  body: recordBodyBase,
});

export const deleteMedicalRecordSchema = z.object({
  params: z.object({
    recordId: commonSchemas.uuid,
  }),
}); 