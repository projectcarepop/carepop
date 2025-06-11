import { z } from 'zod';

export const assignServiceToProviderSchema = z.object({
  service_id: z.string().uuid('A valid service ID is required.'),
}); 