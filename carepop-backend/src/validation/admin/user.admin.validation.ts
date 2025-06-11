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

export const updateUserBodySchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  roles: z.array(z.string()).optional(),
}); 