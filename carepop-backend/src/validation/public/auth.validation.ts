import { z } from 'zod';

export const signUpSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const loginWithGoogleSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Google authorization code is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('A valid email is required'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'New password must be at least 8 characters long'),
  }),
}); 