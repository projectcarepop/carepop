import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger';

class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Handle other types of errors
  if (err.name === 'ValidationError') { // Example for Zod or other validation
    return res.status(400).json({ status: 'error', message: err.message });
  }


  res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred',
  });
};

export default AppError; 