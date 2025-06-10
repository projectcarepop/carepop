import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ApiError } from '@/utils/ApiError';
import { StatusCodes } from 'http-status-codes';

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
        return next(new ApiError(StatusCodes.UNAUTHORIZED, 'User has not been authenticated or has no role.'));
    }

    const hasRequiredRole = allowedRoles.includes(req.user.role);

    if (!hasRequiredRole) {
      return next(new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to perform this action.'));
    }

    next();
  };
}; 