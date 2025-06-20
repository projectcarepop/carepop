import { z } from 'zod';

// We will add Zod schemas for validating request bodies,
// like the registration schema, here.

export const registerUserSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' }),
  });

export const loginUserSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
}); 