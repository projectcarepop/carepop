import { z } from 'zod';

export const getProvidersForServiceSchema = z.object({
  clinicId: z.string().uuid('Invalid clinic ID format'),
  serviceId: z.string().uuid('Invalid service ID format'),
}); 