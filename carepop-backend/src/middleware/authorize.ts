import { Request, Response, NextFunction } from 'express';

class HttpError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !user.roles) {
      return next(new HttpError('Authentication required. Please log in.', 401));
    }

    const hasPermission = user.roles.some(role => allowedRoles.includes(role));

    if (hasPermission) {
      return next();
    }

    return next(new HttpError('You do not have permission to perform this action.', 403));
  };
}; 