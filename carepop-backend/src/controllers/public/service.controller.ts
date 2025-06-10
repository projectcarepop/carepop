import { Request, Response } from 'express';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import * as servicePublicService from '@/services/public/service.service';
import { sendSuccess } from '@/lib/utils/sendSuccess';

export const listPublicServices = asyncHandler(async (req: Request, res: Response) => {
  const services = await servicePublicService.getPublicServices();
  sendSuccess(res, { data: services });
}); 