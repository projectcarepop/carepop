import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync(req.body);
        return next();
    } catch (error: any) {
        const errorMessages = error.errors.map((e: any) => e.message).join(', ');
        return res.status(400).json({ message: errorMessages });
    }
}; 