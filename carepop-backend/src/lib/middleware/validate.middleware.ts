import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';

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
        const errorMessages = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        const appError = new AppError('Invalid request data', StatusCodes.BAD_REQUEST);
        (appError as any).errors = errorMessages;
        next(appError);
      } else {
        next(new AppError('Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR));
      }
    }
}; 