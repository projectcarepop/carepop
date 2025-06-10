import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ClinicAdminService } from '@/services/admin/clinic.service';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { AppError } from '@/lib/utils/appError';
import { sendSuccess, sendCreated } from '@/utils/responseHandler';
import { listClinicsQuerySchema } from '@/validation/admin/clinic.validation';

const clinicService = new ClinicAdminService();

export const createClinic = asyncHandler(async (req: Request, res: Response) => {
  const newClinic = await clinicService.create(req.body);
  sendCreated(res, newClinic);
});

export const getClinics = asyncHandler(async (req: Request, res: Response) => {
  const query = await listClinicsQuerySchema.parseAsync(req.query);
  const result = await clinicService.findAll(query);
  sendSuccess(res, result);
});

export const getClinicById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const clinic = await clinicService.findOne(id);
  if (!clinic) {
    throw new AppError('Clinic not found', StatusCodes.NOT_FOUND);
  }
  sendSuccess(res, clinic);
});

export const updateClinic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedClinic = await clinicService.update(id, req.body);
  if (!updatedClinic) {
    throw new AppError('Clinic not found', StatusCodes.NOT_FOUND);
  }
  sendSuccess(res, updatedClinic);
});

export const deleteClinic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await clinicService.remove(id);
  res.status(StatusCodes.NO_CONTENT).send();
}); 