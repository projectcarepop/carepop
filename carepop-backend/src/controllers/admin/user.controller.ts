import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserAdminService } from '@/services/admin/userService';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { AppError } from '@/lib/utils/appError';
import { sendSuccess } from '@/utils/responseHandler';
import { listUsersQuerySchema } from '@/validation/admin/user.validation';

const userService = new UserAdminService();

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = await listUsersQuerySchema.parseAsync(req.query);
  const result = await userService.findAll(query);
  sendSuccess(res, result);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.findOne(id);
  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND);
  }
  sendSuccess(res, user);
});

export const updateUserRoles = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { roles } = req.body;

    await userService.updateUserRoles(id, roles);
    
    const updatedUser = await userService.findOne(id);
    if (!updatedUser) {
        throw new AppError('User not found after role update', StatusCodes.NOT_FOUND);
    }
    
    sendSuccess(res, updatedUser);
});

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  // The authMiddleware has already fetched and attached the full user profile.
  // We can trust it and send it back directly.
  if (!req.user) {
    // This check is for type safety and as a fallback.
    throw new AppError('Authenticated user not found on request.', StatusCodes.UNAUTHORIZED);
  }
  sendSuccess(res, req.user);
});