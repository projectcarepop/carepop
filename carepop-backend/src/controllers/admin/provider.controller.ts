import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ProviderAdminService } from '@/services/admin/provider.service';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { AppError } from '@/lib/utils/appError';
import { sendSuccess, sendCreated } from '@/utils/responseHandler';
import { listProvidersQuerySchema } from '@/validation/admin/provider.validation';

const providerService = new ProviderAdminService();

export const createProvider = asyncHandler(async (req: Request, res: Response) => {
  const newProvider = await providerService.create(req.body);
  sendCreated(res, newProvider);
});

export const getProviders = asyncHandler(async (req: Request, res: Response) => {
  const query = await listProvidersQuerySchema.parseAsync(req.query);
  const result = await providerService.findAll(query);
  sendSuccess(res, result);
});

export const getProviderById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const provider = await providerService.findOne(id);
  if (!provider) {
    throw new AppError('Provider not found', StatusCodes.NOT_FOUND);
  }
  sendSuccess(res, provider);
});

export const updateProvider = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedProvider = await providerService.update(id, req.body);
  if (!updatedProvider) {
    throw new AppError('Provider not found', StatusCodes.NOT_FOUND);
  }
  sendSuccess(res, updatedProvider);
});

export const deleteProvider = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await providerService.remove(id);
  res.status(StatusCodes.NO_CONTENT).send();
}); 