import { Request, Response } from 'express';
import * as dashboardService from '@/services/admin/dashboard.service';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { sendSuccess } from '@/utils/responseHandler';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';

const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await dashboardService.getDashboardStats();
  sendSuccess(res, { message: 'Dashboard statistics retrieved successfully.', data: stats });
});

const grantAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) {
    throw new AppError('User ID is required.', StatusCodes.BAD_REQUEST);
  }
  const result = await dashboardService.grantAdminRole(userId);
  sendSuccess(res, result);
});

export { getStats, grantAdmin }; 