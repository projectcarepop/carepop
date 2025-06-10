import { z } from 'zod';
import { commonSchemas } from '../commonSchemas';

export const createSupplierSchema = z.object({
  name: commonSchemas.nonEmptyString,
  contact_person: commonSchemas.optionalString,
  contact_email: z.string().email({ message: "Invalid email format." }).optional().nullable(),
  contact_phone: commonSchemas.optionalString,
  address: commonSchemas.optionalString,
  is_active: z.boolean().default(true),
});

export const updateSupplierSchema = createSupplierSchema.partial(); 