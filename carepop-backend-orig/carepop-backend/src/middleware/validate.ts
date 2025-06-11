import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';

export const validate = (schema: { body?: AnyZodObject, query?: AnyZodObject, params?: AnyZodObject }) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'Validation failed',
          errors: errorMessages,
        });
      }
      // Forward other errors
      next(error);
    }
}; 