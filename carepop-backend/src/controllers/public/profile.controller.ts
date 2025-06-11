import { Response } from 'express';
import { AuthenticatedRequest } from '@/lib/middleware/auth.middleware';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { getUserProfileService } from '@/services/public/profile.service';
import { sendSuccess } from '@/utils/responseHandler';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';

export const getMyProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError('User not authenticated', StatusCodes.UNAUTHORIZED);
  }

  const profile = await getUserProfileService(req.user.id);

  if (!profile) {
    throw new AppError('Profile not found', StatusCodes.NOT_FOUND);
  }

  sendSuccess(res, { message: 'Profile retrieved successfully', data: profile });
}); 