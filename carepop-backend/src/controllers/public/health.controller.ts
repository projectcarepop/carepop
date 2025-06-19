import { Request, Response } from 'express';
import { asyncHandler } from '../../lib/utils/asyncHandler';
import { sendSuccess } from '../../lib/utils/sendSuccess';
import * as healthService from '../../services/public/health.service';
import { z } from 'zod';

const healthEntrySchema = z.object({
  type: z.string(),
  value_text: z.string().optional(),
  value_numeric: z.number().optional(),
  notes: z.string().optional(),
});

export const healthController = {
  createEntry: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const entryData = healthEntrySchema.parse(req.body);

    const newEntry = await healthService.createHealthEntry(userId, entryData);
    res.status(201);
    sendSuccess(res, { data: newEntry });
  }),

  getEntries: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const entryType = req.query.type as string;

    if (!entryType) {
      return res.status(400).json({ message: 'Entry type query parameter is required.' });
    }

    const entries = await healthService.getHealthEntries(userId, entryType);
    sendSuccess(res, { data: entries });
  }),
}; 