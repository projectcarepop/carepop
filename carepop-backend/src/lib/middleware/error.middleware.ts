import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { AppError } from '@/lib/utils/appError';
import logger from '@/utils/logger';

const handleZodError = (err: ZodError): AppError => {
  const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let error = err;
  
  if (err instanceof ZodError) {
    error = handleZodError(err);
  }

  if (!(error instanceof AppError)) {
    logger.error('Unhandled Error:', error);
    error = new AppError('An unexpected error occurred.', StatusCodes.INTERNAL_SERVER_ERROR, false);
  }

  const { statusCode, message, isOperational } = error as AppError;

  if (!isOperational) {
    // In a real production app, you might want to exit the process
    // if a critical, non-operational error occurs.
    logger.error('CRITICAL NON-OPERATIONAL ERROR. SHUTTING DOWN GRACEFULLY...', error);
    // process.exit(1); 
  }
  
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}; 