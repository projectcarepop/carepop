import { Request, Response } from 'express';
import { registerUserService, loginUserService } from '../services/authService';
import { asyncHandler } from '../utils/asyncHandler';
import { sendCreated, sendSuccess } from '../utils/responseHandler';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { user } = await registerUserService(req.body);
  sendCreated(res, { user });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { user, session } = await loginUserService(req.body);
  sendSuccess(res, { user, session });
});