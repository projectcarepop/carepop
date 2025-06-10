import { z } from 'zod';
import { commonSchemas } from '../commonSchemas';

export const createInventoryItemSchema = z.object({
  item_name: commonSchemas.nonEmptyString,
  generic_name: commonSchemas.optionalString,
  brand_name: commonSchemas.optionalString,
  category: commonSchemas.optionalString,
  form: commonSchemas.optionalString,
  strength_dosage: commonSchemas.optionalString,
  quantity_on_hand: commonSchemas.positiveInteger,
  reorder_level: commonSchemas.positiveInteger,
  purchase_cost: commonSchemas.nonNegativeNumber.optional().nullable(),
  selling_price: commonSchemas.nonNegativeNumber,
  supplier_id: commonSchemas.uuid,
  is_active: z.boolean().default(true),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial(); 