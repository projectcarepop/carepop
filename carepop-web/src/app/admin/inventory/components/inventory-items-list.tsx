import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { InventoryItemsListClient } from './inventory-items-list.client';

const inventoryItemSearchSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
});

export type GetInventoryItemsParams = z.infer<typeof inventoryItemSearchSchema>;

export interface IInventoryItem {
  id: string;
  item_name: string;
  category?: string | null;
  sku?: string | null;
  quantity_on_hand: number;
  is_active: boolean;
  supplier: {
    id: string;
    name: string;
  } | null;
}

async function getInventoryItems(params: GetInventoryItemsParams) {
  const supabase = await createSupabaseServerClient();
  const { page, per_page, sort, search } = params;

  const [sortField, sortOrder] = sort?.split('.') || ['item_name', 'asc'];
  const offset = (page - 1) * per_page;

  let query = supabase
    .from('inventory_items')
    .select(`
        id,
        item_name,
        category,
        sku,
        quantity_on_hand,
        is_active,
        supplier:suppliers (id, name)
    `, { count: 'exact' })
    .range(offset, offset + per_page - 1)
    .order(sortField, { ascending: sortOrder === 'asc' });

  if (search) {
    query = query.or(`item_name.ilike.%${search}%,sku.ilike.%${search}%,category.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching inventory items:', error);
    return { data: [], totalRecords: 0 };
  }

  return { data: (data as unknown as IInventoryItem[]) || [], totalRecords: count ?? 0 };
}

export async function InventoryItemsList(props: GetInventoryItemsParams) {
  const validatedParams = inventoryItemSearchSchema.parse(props);
  const { data, totalRecords } = await getInventoryItems(validatedParams);

  return <InventoryItemsListClient data={data} totalRecords={totalRecords} />;
} 