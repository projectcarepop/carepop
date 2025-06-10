import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  contact_person: z.string().optional(),
  contact_email: z.string().email("Invalid email address").optional().nullable(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const supplierIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listSuppliersQuerySchema = z.object({
    page: z.preprocess((val) => Number(val), z.number().int().min(1)).optional().default(1),
    limit: z.preprocess((val) => Number(val), z.number().int().min(1)).optional().default(10),
    search: z.string().optional(),
    sortBy: z.string().optional().default('name'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
}); 