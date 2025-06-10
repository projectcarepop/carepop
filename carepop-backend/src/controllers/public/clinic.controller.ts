import { Request, Response } from 'express';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import * as clinicPublicService from '@/services/public/clinic.service';
import { sendSuccess } from '@/lib/utils/sendSuccess';

export const listPublicClinics = asyncHandler(async (req: Request, res: Response) => {
  const clinics = await clinicPublicService.getPublicClinics();
  sendSuccess(res, { data: clinics });
}); 