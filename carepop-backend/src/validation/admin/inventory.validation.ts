import { z } from 'zod';

// Based on alltables.json for the 'inventory_items' table
export const createInventoryItemSchema = z.object({
  item_name: z.string().min(1, "Item name is required"),
  generic_name: z.string().optional(),
  brand_name: z.string().optional(),
  category: z.string().optional(),
  sku: z.string().optional(),
  quantity_on_hand: z.number().int().min(0).default(0),
  reorder_level: z.number().int().min(0).optional(),
  supplier_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().default(true),
  purchase_cost: z.number().min(0).optional(),
  selling_price: z.number().min(0).optional(),
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial();

export const inventoryIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listInventoryQuerySchema = z.object({
  page: z.preprocess((val) => Number(val), z.number().int().min(1)).optional().default(1),
  limit: z.preprocess((val) => Number(val), z.number().int().min(1)).optional().default(10),
  search: z.string().optional(),
  sortBy: z.string().optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
}); 