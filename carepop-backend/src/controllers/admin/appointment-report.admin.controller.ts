// This file is temporarily simplified to prevent build failures for the demo.
// The original functionality depended on a more complex service layer that has been refactored.
import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';

export const getAppointmentReport = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: 'This feature is temporarily disabled for the demo.' });
});

export const upsertAppointmentReportHandler = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: 'This feature is temporarily disabled for the demo.' });
}); 