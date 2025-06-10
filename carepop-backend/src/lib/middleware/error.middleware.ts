import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/lib/utils/appError';
import { logger } from '@/config/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn(`Application Error: ${err.message}`, {
      statusCode: err.statusCode,
      isOperational: err.isOperational,
      path: req.path,
    });
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  logger.error('An unexpected error occurred!', {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  // Don't leak error details in production for non-operational errors
  const message = process.env.NODE_ENV === 'production' 
    ? 'An internal server error occurred.' 
    : err.message;

  return res.status(500).json({
    status: 'error',
    message,
  });
}; 