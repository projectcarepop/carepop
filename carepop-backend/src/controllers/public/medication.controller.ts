import { Request, Response } from 'express';
import { asyncHandler } from '../../lib/utils/asyncHandler';
import { sendSuccess } from '../../lib/utils/sendSuccess';
import * as medicationService from '../../services/public/medication.service';
import { z } from 'zod';
import { commonSchemas } from '../../validation/commonSchemas';

// --- Validation Schemas ---
const createMedSchema = z.object({
  name: z.string().min(1, 'Medication name cannot be empty.'),
  dosage: z.string().optional(),
});

const updateMedSchema = createMedSchema.partial().extend({
  is_active: z.boolean().optional(),
});

const logMedSchema = z.object({
  medication_id: z.string().uuid(),
});


export const medicationController = {
  // --- Medication CRUD ---
  getMeds: asyncHandler(async (req: Request, res: Response) => {
    const meds = await medicationService.getMedicationsForUser(req.user.id);
    sendSuccess(res, { data: meds });
  }),

  createMed: asyncHandler(async (req: Request, res: Response) => {
    const medData = createMedSchema.parse(req.body);
    const newMed = await medicationService.createMedication(req.user.id, medData);
    sendSuccess(res, { data: newMed, statusCode: 201 });
  }),

  updateMed: asyncHandler(async (req: Request, res: Response) => {
    const medId = commonSchemas.uuid.parse(req.params.id);
    const medData = updateMedSchema.parse(req.body);
    const updatedMed = await medicationService.updateMedication(medId, req.user.id, medData);
    sendSuccess(res, { data: updatedMed });
  }),
  
  deleteMed: asyncHandler(async (req: Request, res: Response) => {
    const medId = commonSchemas.uuid.parse(req.params.id);
    await medicationService.deleteMedication(medId, req.user.id);
    sendSuccess(res, { message: 'Medication deactivated successfully.' });
  }),

  // --- Logging ---
  logTaken: asyncHandler(async (req: Request, res: Response) => {
    const { medication_id } = logMedSchema.parse(req.body);
    const log = await medicationService.logMedicationTaken(req.user.id, medication_id);
    sendSuccess(res, { data: log, statusCode: 201 });
  }),

  getLogs: asyncHandler(async (req: Request, res: Response) => {
    const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.").parse(req.query.date);
    const logs = await medicationService.getMedicationLogsForDate(req.user.id, date);
    sendSuccess(res, { data: logs });
  }),
}; 