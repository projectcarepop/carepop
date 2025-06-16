import { Request, Response } from 'express';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { sendSuccess } from '@/lib/utils/sendSuccess';
import * as menstrualService from '@/services/public/menstrual.service';
import { z } from 'zod';
import { commonSchemas } from '@/validation/commonSchemas';

// --- Validation Schemas ---
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.");

const startCycleSchema = z.object({
  start_date: dateSchema,
});

const endCycleSchema = z.object({
  end_date: dateSchema,
});

const upsertSymptomSchema = z.object({
  log_date: dateSchema,
  symptoms: z.array(z.string().min(1)).min(1, 'At least one symptom is required.'),
  notes: z.string().optional(),
});

const getSymptomsSchema = z.object({
    start_date: dateSchema,
    end_date: dateSchema,
});


export const menstrualController = {
  // --- Cycle Management ---
  getCycles: asyncHandler(async (req: Request, res: Response) => {
    const cycles = await menstrualService.getCyclesForUser(req.user.id);
    sendSuccess(res, { data: cycles });
  }),

  startNewCycle: asyncHandler(async (req: Request, res: Response) => {
    const { start_date } = startCycleSchema.parse(req.body);
    const newCycle = await menstrualService.startCycle(req.user.id, start_date);
    sendSuccess(res, { data: newCycle, statusCode: 201 });
  }),

  endCurrentCycle: asyncHandler(async (req: Request, res: Response) => {
    const cycleId = commonSchemas.uuid.parse(req.params.id);
    const { end_date } = endCycleSchema.parse(req.body);
    const updatedCycle = await menstrualService.endCycle(cycleId, req.user.id, end_date);
    sendSuccess(res, { data: updatedCycle });
  }),
  
  // --- Symptom Logging ---
  upsertSymptoms: asyncHandler(async (req: Request, res: Response) => {
    const { log_date, symptoms, notes } = upsertSymptomSchema.parse(req.body);
    const log = await menstrualService.upsertSymptomLog(req.user.id, log_date, symptoms, notes);
    sendSuccess(res, { data: log });
  }),

  getSymptoms: asyncHandler(async (req: Request, res: Response) => {
    const { start_date, end_date } = getSymptomsSchema.parse(req.query);
    const logs = await menstrualService.getSymptomLogsForPeriod(req.user.id, start_date, end_date);
    sendSuccess(res, { data: logs });
  }),
}; 