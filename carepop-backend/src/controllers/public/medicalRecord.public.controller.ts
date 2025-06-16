import { Request, Response } from 'express';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { sendSuccess } from '@/utils/responseHandler';
import { MedicalRecordPublicService } from '@/services/public/medicalRecord.public.service';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';

const medicalRecordService = new MedicalRecordPublicService();

export const getMyMedicalRecords = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new AppError('Authentication required.', StatusCodes.UNAUTHORIZED);
    }
    const records = await medicalRecordService.findRecordsByUserId(req.user.id);
    sendSuccess(res, records);
});

export const getMedicalRecordSignedUrl = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new AppError('Authentication required.', StatusCodes.UNAUTHORIZED);
    }
    const { recordId } = req.params;
    const signedUrlData = await medicalRecordService.createSignedUrl(req.user.id, recordId);
    sendSuccess(res, signedUrlData);
}); 