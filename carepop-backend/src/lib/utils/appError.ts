import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  public readonly statusCode: StatusCodes;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: StatusCodes, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
} 