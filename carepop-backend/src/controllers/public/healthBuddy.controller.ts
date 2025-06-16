import { Request, Response } from 'express';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import * as healthBuddyService from '@/services/public/healthBuddy.service';
import { sendSuccess } from '@/lib/utils/sendSuccess';
import { z } from 'zod';

const logMoodSchema = z.object({
  type: z.literal('MOOD'),
  value_text: z.enum(['Happy', 'Calm', 'Okay', 'Anxious', 'Sad']),
});

const logBPSchema = z.object({
    type: z.literal('BLOOD_PRESSURE'),
    value_numeric: z.number().int().positive(),
    notes: z.string().optional(), // For diastolic
});

const logActivitySchema = z.object({
    type: z.literal('ACTIVITY'),
    value_numeric: z.number().int().positive(),
});

export const healthBuddyController = {
  logMood: asyncHandler(async (req: Request, res: Response) => {
    const data = logMoodSchema.parse(req.body);
    const entry = await healthBuddyService.createHealthEntry(req.user.id, data);
    sendSuccess(res, { data: entry, statusCode: 201 });
  }),

  getMoodLogs: asyncHandler(async (req: Request, res: Response) => {
    const entries = await healthBuddyService.getHealthEntries(req.user.id, 'MOOD');
    sendSuccess(res, { data: entries });
  }),

  logBloodPressure: asyncHandler(async (req: Request, res: Response) => {
    const data = logBPSchema.parse(req.body);
    const entry = await healthBuddyService.createHealthEntry(req.user.id, data);
    sendSuccess(res, { data: entry, statusCode: 201 });
  }),

  getBloodPressureLogs: asyncHandler(async (req: Request, res: Response) => {
    const entries = await healthBuddyService.getHealthEntries(req.user.id, 'BLOOD_PRESSURE');
    sendSuccess(res, { data: entries });
  }),

  logDailyActivity: asyncHandler(async (req: Request, res: Response) => {
    const data = logActivitySchema.parse(req.body);
    const entry = await healthBuddyService.createHealthEntry(req.user.id, data);
    sendSuccess(res, { data: entry, statusCode: 201 });
  }),

  getDailyActivityLogs: asyncHandler(async (req: Request, res: Response) => {
    const entries = await healthBuddyService.getHealthEntries(req.user.id, 'ACTIVITY');
    sendSuccess(res, { data: entries });
  }),
}; 