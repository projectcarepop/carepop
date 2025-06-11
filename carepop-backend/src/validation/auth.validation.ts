import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
}); 