import { Request, Response } from 'express';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import * as clinicPublicService from '@/services/public/clinic.service';
import { sendSuccess } from '@/lib/utils/sendSuccess';

export const listPublicClinics = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lon } = req.query;
  const latitude = lat ? parseFloat(lat as string) : undefined;
  const longitude = lon ? parseFloat(lon as string) : undefined;
  
  const clinics = await clinicPublicService.getPublicClinics(latitude, longitude);
  sendSuccess(res, { data: clinics });
});

export const listServicesForClinic = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.params;
  const services = await clinicPublicService.getServicesForClinic(clinicId);
  sendSuccess(res, { data: services });
}); 