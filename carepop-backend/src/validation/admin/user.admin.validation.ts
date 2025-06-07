import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  search: z.string().optional(),
  role: z.string().optional(),
});

export const getUserParamsSchema = z.object({
  userId: z.string().uuid(),
}); 