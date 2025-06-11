import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  public readonly statusCode: StatusCodes;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(message: string, statusCode: StatusCodes, details?: any, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
} 