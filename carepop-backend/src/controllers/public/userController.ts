import { Request, Response } from 'express';
import { UserService } from '@/services/public/userService';
import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';

const userService = new UserService();

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  // The user object is attached to the request by the authMiddleware
  const userId = (req as any).user.id;

  const profile = await userService.getUserProfile(userId);

  res.status(200).json(new ApiResponse(200, profile, 'Profile fetched successfully'));
}); 