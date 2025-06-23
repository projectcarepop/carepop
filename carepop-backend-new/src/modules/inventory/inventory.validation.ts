import { z } from 'zod';

// Schema for creating a new supplier
export const createSupplierSchema = z.object({
  name: z.string().min(2, 'Supplier name must be at least 2 characters long'),
  contactPerson: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Type inferred from the schema
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

// Schema for updating an existing supplier (all fields are optional)
export const updateSupplierSchema = createSupplierSchema.partial();

// Type inferred from the update schema
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>; 