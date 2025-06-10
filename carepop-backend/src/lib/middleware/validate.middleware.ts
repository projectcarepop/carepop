import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '@/utils/ApiError';

interface ValidationSchemas {
  params?: AnyZodObject;
  body?: AnyZodObject;
  query?: AnyZodObject;
}

export const validateRequest = (schemas: ValidationSchemas) => 
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
            const errorMessages = error.errors.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            }));
            const apiError = new ApiError(400, 'Invalid request data');
            (apiError as any).errors = errorMessages;
            next(apiError);
        } else {
            next(new ApiError(500, 'Internal Server Error'));
        }
    }
}; 