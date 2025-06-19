// This file is temporarily simplified to prevent build failures for the demo.
import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';

export const debugAppointment = asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ message: 'This feature is temporarily disabled for the demo.' });
});