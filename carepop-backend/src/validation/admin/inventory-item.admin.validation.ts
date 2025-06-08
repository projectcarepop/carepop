import { z } from 'zod';

export const createInventoryItemSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  generic_name: z.string().optional().nullable(),
  brand_name: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  drug_classification: z.string().optional().nullable(),
  form: z.string().optional().nullable(),
  strength_dosage: z.string().optional().nullable(),
  packaging: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  quantity_on_hand: z.number().int().min(0).default(0),
  reorder_level: z.number().int().min(0).optional().nullable(),
  reorder_quantity: z.number().int().min(0).optional().nullable(),
  min_stock_level: z.number().int().min(0).optional().nullable(),
  max_stock_level: z.number().int().min(0).optional().nullable(),
  purchase_cost: z.number().min(0).optional().nullable(),
  selling_price: z.number().min(0).optional().nullable(),
  is_active: z.boolean().default(true),
  supplier_id: z.string().uuid().optional().nullable(),
  storage_requirements: z.string().optional().nullable(),
  fda_registration_number: z.string().optional().nullable(),
  controlled_substance_code: z.string().optional().nullable(),
  prescription_requirement: z.string().optional().nullable(),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial(); 