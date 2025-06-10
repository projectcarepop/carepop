import { Request, Response, NextFunction } from 'express';
import { UserService } from '@/services/public/userService';
import { asyncHandler } from '@/utils/asyncHandler';
import { AuthenticatedRequest } from '@/lib/middleware/auth.middleware';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';

const userService = new UserService();

export const getMyProfile = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.sub;
    if (!userId) {
      throw new AppError('Unauthorized: No user identified from token.', StatusCodes.UNAUTHORIZED);
    }
    const profile = await userService.getUserProfile(userId);
    if (!profile) {
      throw new AppError('Profile not found for the provided user ID.', StatusCodes.NOT_FOUND);
    }
    res.status(StatusCodes.OK).json({ status: 'success', data: profile });
  }
); 