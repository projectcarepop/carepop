import { z } from 'zod';

// For now, we only allow updating the user's role.
// We can expand this schema as more fields become editable by admins.
export const updateUserSchema = z.object({
  role: z.enum(['admin', 'user']).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>; 