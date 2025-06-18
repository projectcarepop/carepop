import { Request, Response } from 'express';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import * as servicePublicService from '@/services/public/service.service';
import { sendSuccess } from '@/lib/utils/sendSuccess';
import { AppError } from '@/lib/utils/appError';

export const listPublicServices = asyncHandler(async (req: Request, res: Response) => {
  const services = await servicePublicService.getPublicServices();
  sendSuccess(res, { data: services });
});

export const listProvidersForService = asyncHandler(async (req: Request, res: Response) => {
    const { serviceId } = req.params;
    if (!serviceId) {
        throw new AppError('Service ID is required.', 400);
    }
    const providers = await servicePublicService.getProvidersForService(serviceId);
    sendSuccess(res, { data: providers });
}); 