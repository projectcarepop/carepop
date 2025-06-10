import { Request, Response } from 'express';
import { UserService } from '@/services/public/userService';
import { asyncHandler } from '@/utils/asyncHandler';
import { ApiResponse } from '@/utils/ApiResponse';
import { ApiError } from '@/utils/ApiError';

const userService = new UserService();

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  // @ts-ignore - The user object is attached by the hardened authMiddleware
  const userId = req.user?.sub; // Supabase JWTs use 'sub' for the user ID.

  if (!userId) {
    // This is a safety net. If the middleware somehow passes a request without a user,
    // we catch it here instead of crashing.
    throw new ApiError(401, 'Unauthorized: No user identified from token.');
  }

  const userProfile = await userService.getUserProfile(userId);

  if (!userProfile) {
    throw new ApiError(404, 'Profile not found for the provided user ID.');
  }

  res.status(200).json(new ApiResponse(200, userProfile, 'User profile fetched successfully'));
}); 