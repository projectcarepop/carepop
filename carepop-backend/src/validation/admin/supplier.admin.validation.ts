import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact_person: z.string().optional().nullable(),
  contact_email: z.string().email('Invalid email address').optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const updateSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  contact_person: z.string().optional().nullable(),
  contact_email: z.string().email('Invalid email address').optional().nullable(),
  contact_phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
}); 