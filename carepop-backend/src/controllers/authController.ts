import { Request, Response } from 'express';
import { registerUserService, loginUserService } from '../services/authService';
import { asyncHandler } from '../utils/asyncHandler';
import { sendCreated, sendSuccess } from '../utils/responseHandler';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerUserService(req.body);
  sendCreated(res, result, 'User registered successfully. Please check your email for verification.');
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginUserService(req.body);
  sendSuccess(res, result, 'User logged in successfully.');
});