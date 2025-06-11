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
    const userProfile = await userService.findProfileById(userId);
    if (!userProfile) {
      throw new AppError('User profile has not been created yet.', StatusCodes.NOT_FOUND);
    }
    res.status(StatusCodes.OK).json({ status: 'success', data: userProfile });
  }
); 