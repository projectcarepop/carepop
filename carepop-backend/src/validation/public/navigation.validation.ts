import { z } from 'zod';

export const getDirectionsSchema = z.object({
  body: z.object({
    origin: z.string({
      required_error: 'Origin is required.',
    }).min(1, 'Origin cannot be empty.'),
    destination: z.string({
      required_error: 'Destination is required.',
    }).min(1, 'Destination cannot be empty.'),
    mode: z.enum(['driving', 'walking'], {
      required_error: 'Mode is required.',
      invalid_type_error: "Mode must be either 'driving' or 'walking'.",
    }),
  }),
}); 