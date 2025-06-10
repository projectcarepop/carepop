import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) {
        return next(new AppError('User has not been authenticated or has no roles.', StatusCodes.UNAUTHORIZED));
    }

    const hasRequiredRole = req.user.roles.some(role => allowedRoles.includes(role));

    if (!hasRequiredRole) {
      return next(new AppError('You do not have permission to perform this action.', StatusCodes.FORBIDDEN));
    }

    next();
  };
}; 