import { Response, NextFunction } from 'express';
import { AppError } from '@/lib/utils/appError';
import { AuthenticatedRequest } from './auth.middleware';
import { StatusCodes } from 'http-status-codes';

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole) {
      return next(new AppError('User has not been authenticated or has no role.', StatusCodes.UNAUTHORIZED));
    }
    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      return next(new AppError('You do not have permission to perform this action.', StatusCodes.FORBIDDEN));
    }
  };
}; 