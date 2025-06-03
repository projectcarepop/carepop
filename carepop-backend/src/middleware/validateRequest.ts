import { Request, Response, NextFunction } from 'express';
import { z, ZodError, AnyZodObject } from 'zod';
import { AppError } from '../utils/errors'; // Assuming AppError is in utils

interface RequestValidationSchemas {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

export const validateRequest = (schemas: RequestValidationSchemas) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(e => ({ 
          path: e.path.join('.'), 
          message: e.message 
        }));
        // Use AppError or send a consistent error response structure
        // For now, sending a generic 400 with Zod error details
        // Consider using your AppError for consistency: 
        // next(new AppError('Validation failed', 400, errorMessages));
        return res.status(400).json({
          message: 'Validation failed', 
          errors: errorMessages 
        });
      }
      // For other types of errors, pass to the global error handler
      next(new AppError('An unexpected error occurred during validation', 500));
    }
  }; 