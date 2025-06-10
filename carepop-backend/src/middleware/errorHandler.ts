import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// It's a good practice to log errors. For now, we'll just console.error.
// In a production environment, you'd use a more robust logger like Winston.
const logError = (error: Error) => {
  console.error(error);
};

const handleZodError = (err: ZodError, res: Response) => {
  const errors = err.errors.map(e => ({ path: e.path.join('.'), message: e.message }));
  return res.status(400).json({
    status: 'error',
    message: 'Validation failed',
    errors,
  });
};

const handleGenericError = (err: AppError, res: Response) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'An unexpected error occurred. Please try again later.';
  
  return res.status(statusCode).json({
    status: 'error',
    message,
  });
};

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  logError(err);

  if (err instanceof ZodError) {
    return handleZodError(err, res);
  }

  return handleGenericError(err, res);
}; 