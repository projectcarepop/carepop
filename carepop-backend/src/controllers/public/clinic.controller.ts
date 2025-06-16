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

export const listProvidersForServiceInClinic = asyncHandler(async (req: Request, res: Response) => {
  const { clinicId } = req.params;
  const { serviceId } = req.query;

  if (!serviceId || typeof serviceId !== 'string') {
    return res.status(400).json({ success: false, message: 'A valid serviceId query parameter is required.' });
  }

  const providers = await clinicPublicService.getProvidersForServiceInClinic(clinicId, serviceId);
  
  // Unlike other endpoints, if no providers are found, we don't treat it as a client-side error.
  // We return a 200 OK with an empty array, which is the expected and correct response.
  sendSuccess(res, { data: providers });
}); 