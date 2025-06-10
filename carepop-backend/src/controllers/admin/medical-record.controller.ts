import { Response } from 'express';
import { AuthenticatedRequest } from '@/types/authenticated-request.interface';
import * as medicalRecordService from '@/services/admin/medical-record.service';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { sendCreated, sendSuccess } from '@/utils/responseHandler';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';

const createRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const { recordTitle, recordDetails } = req.body;
  const adminId = req.user!.id;
  const file = req.file;

  if (!recordTitle) {
    throw new AppError('Record title is required.', StatusCodes.BAD_REQUEST);
  }

  const record = await medicalRecordService.createRecord(userId, adminId, recordTitle, recordDetails, file);
  sendCreated(res, { message: 'Medical record created successfully.', data: record });
});

const getRecordsForUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const records = await medicalRecordService.getRecordsForUser(userId);
  sendSuccess(res, { message: 'Records retrieved successfully.', data: records });
});

const updateRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { recordId } = req.params;
  const { recordTitle, recordDetails } = req.body;
  const updatedRecord = await medicalRecordService.updateRecord(recordId, recordTitle, recordDetails);
  sendSuccess(res, { message: 'Record updated successfully.', data: updatedRecord });
});

const deleteRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { recordId } = req.params;
  await medicalRecordService.deleteRecord(recordId);
  sendSuccess(res, { message: 'Record deleted successfully.' });
});

export { createRecord, getRecordsForUser, updateRecord, deleteRecord }; 