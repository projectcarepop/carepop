import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { registerUserService, loginUserService } from '@/services/public/auth.service';
import { registerUserSchema, loginUserSchema } from '@/validation/auth.validation';
import { AppError } from '@/lib/utils/appError';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { sendSuccess, sendCreated } from '@/utils/responseHandler';

export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const validationResult = registerUserSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError('Validation failed', StatusCodes.BAD_REQUEST, validationResult.error.errors);
  }

  const result = await registerUserService(validationResult.data);

  if (!result.success || !result.user) {
    // The service layer should return a more specific error message.
    throw new AppError(result.message || 'Registration failed', StatusCodes.BAD_REQUEST, result.error);
  }

  sendCreated(res, { 
    message: result.message, 
    data: { userId: result.user.id, email: result.user.email } 
  });
});

export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const validationResult = loginUserSchema.safeParse(req.body);
  if (!validationResult.success) {
    throw new AppError('Validation failed', StatusCodes.BAD_REQUEST, validationResult.error.errors);
  }

  const result = await loginUserService(validationResult.data);

  if (!result.success || !result.session) {
    throw new AppError(result.message || 'Login failed', StatusCodes.UNAUTHORIZED, result.error);
  }

  sendSuccess(res, {
    message: result.message,
    data: {
      accessToken: result.session.access_token,
      refreshToken: result.session.refresh_token,
      user: {
        id: result.user?.id,
        email: result.user?.email,
        role: result.user?.user_metadata?.role
      }
    }
  });
}); 