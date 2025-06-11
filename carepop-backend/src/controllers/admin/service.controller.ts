import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ServiceAdminService } from '@/services/admin/service.service';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { AppError } from '@/lib/utils/appError';
import { sendSuccess, sendCreated } from '@/utils/responseHandler';
import { listServicesQuerySchema } from '@/validation/admin/service.validation';

const serviceService = new ServiceAdminService();

export const createService = asyncHandler(async (req: Request, res: Response) => {
  const newService = await serviceService.create(req.body);
  sendCreated(res, newService);
});

export const getServices = asyncHandler(async (req: Request, res: Response) => {
  const query = await listServicesQuerySchema.parseAsync(req.query);
  const result = await serviceService.findAll(query);
  sendSuccess(res, result);
});

export const getServiceById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const service = await serviceService.findOne(id);
  if (!service) {
    throw new AppError('Service not found', StatusCodes.NOT_FOUND);
  }
  sendSuccess(res, service);
});

export const updateService = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedService = await serviceService.update(id, req.body);
  if (!updatedService) {
    throw new AppError('Service not found', StatusCodes.NOT_FOUND);
  }
  sendSuccess(res, updatedService);
});

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await serviceService.remove(id);
  res.status(StatusCodes.NO_CONTENT).send();
}); 