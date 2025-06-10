import { Request, Response } from 'express';
import * as providerService from '@/services/admin/provider-service.service';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { sendCreated, sendSuccess } from '@/utils/responseHandler';
import { StatusCodes } from 'http-status-codes';

const getServicesForProvider = asyncHandler(async (req: Request, res: Response) => {
  const { providerId } = req.params;
  const services = await providerService.getServicesForProvider(providerId);
  sendSuccess(res, { message: 'Services for provider retrieved successfully.', data: services });
});

const getProvidersForService = asyncHandler(async (req: Request, res: Response) => {
  const { serviceId } = req.params;
  const providers = await providerService.getProvidersForService(serviceId);
  sendSuccess(res, { message: 'Providers for service retrieved successfully.', data: providers });
});

const assignServiceToProvider = asyncHandler(async (req: Request, res: Response) => {
  const { providerId } = req.params;
  const { serviceId } = req.body;
  const assignment = await providerService.assignServiceToProvider(providerId, serviceId);
  sendCreated(res, { message: 'Service assigned to provider successfully.', data: assignment });
});

const unassignServiceFromProvider = asyncHandler(async (req: Request, res: Response) => {
  const { providerId, serviceId } = req.params;
  await providerService.unassignServiceFromProvider(providerId, serviceId);
  res.status(StatusCodes.NO_CONTENT).send();
});

export {
  getServicesForProvider,
  getProvidersForService,
  assignServiceToProvider,
  unassignServiceFromProvider,
}; 