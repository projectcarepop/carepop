export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, details?: any, isOperational: boolean = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain

    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational; // Operational errors are expected, vs. programming errors

    Error.captureStackTrace(this, this.constructor);
  }
}

// You might also want a global error handler middleware in your Express app
// that uses this AppError to send consistent error responses. 