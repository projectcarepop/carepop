import { Request, Response } from 'express';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { NavigationService } from '@/services/public/navigationService';
import { sendSuccess } from '@/utils/responseHandler';

const navigationService = new NavigationService();

export const getRoute = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add validation for the request body.
  const routeRequest = req.body;
  const route = await navigationService.getRoute(routeRequest);
  sendSuccess(res, route);
}); 