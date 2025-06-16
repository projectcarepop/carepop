import { Request, Response } from 'express';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { sendCreated } from '@/utils/responseHandler';
import { MedicalRecordAdminService } from '@/services/admin/medicalRecord.admin.service';
import { AppError } from '@/lib/utils/appError';

const medicalRecordService = new MedicalRecordAdminService();

export const createMedicalRecord = asyncHandler(async (req: Request, res: Response) => {
    const { file } = req;
    if (!file) {
        // This check is for type safety and should theoretically be handled by multer middleware setup.
        throw new AppError('No file uploaded.', 400);
    }
    const {
        userId,
        recordType,
        description,
        clinicId,
        providerId,
        appointmentId
    } = req.body;

    const newRecord = await medicalRecordService.createMedicalRecord(
        file,
        userId,
        recordType,
        description,
        clinicId,
        providerId,
        appointmentId
    );

    sendCreated(res, newRecord);
}); 