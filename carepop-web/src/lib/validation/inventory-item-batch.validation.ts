import { z } from 'zod';

export const batchFormSchema = z.object({
  item_id: z.string().uuid(),
  batch_number: z.string().min(1, 'Batch number is required'),
  quantity: z.coerce.number().int().min(0, 'Quantity must be a positive number'),
  expiration_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  cost_per_item: z.coerce.number().min(0).optional().nullable(),
  supplier_id: z.string().uuid().optional().nullable(),
}); 