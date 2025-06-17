'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const itemFormSchema = z.object({
  item_name: z.string().min(1, 'Item name is required'),
  generic_name: z.string().optional().nullable(),
  brand_name: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  form: z.string().optional().nullable(),
  strength_dosage: z.string().optional().nullable(),
  packaging: z.string().optional().nullable(),
  quantity_on_hand: z.coerce.number().int().min(0),
  reorder_level: z.coerce.number().int().min(0).optional().nullable(),
  purchase_cost: z.coerce.number().min(0).optional().nullable(),
  selling_price: z.coerce.number().min(0).optional().nullable(),
  supplier_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean(),
  storage_requirements: z.string().optional().nullable(),
});

export async function createInventoryItem(values: z.infer<typeof itemFormSchema>) {
    const supabase = createClient();
    const validatedData = itemFormSchema.parse(values);
    const { error } = await supabase.from('inventory_items').insert([validatedData]);

    if (error) {
        return { success: false, message: `Failed to create item: ${error.message}` };
    }
    revalidatePath('/admin/inventory');
    return { success: true, message: 'Item created successfully.' };
}

export async function updateInventoryItem(itemId: string, values: z.infer<typeof itemFormSchema>) {
    const supabase = createClient();
    const validatedData = itemFormSchema.parse(values);
    const { error } = await supabase.from('inventory_items').update(validatedData).eq('id', itemId);
    
    if (error) {
        return { success: false, message: `Failed to update item: ${error.message}` };
    }
    revalidatePath('/admin/inventory');
    return { success: true, message: 'Item updated successfully.' };
}

export async function deleteInventoryItem(itemId: string) {
    const supabase = createClient();
    const { error } = await supabase.from('inventory_items').delete().eq('id', itemId);
    if (error) {
        return { success: false, message: 'Failed to delete inventory item.' };
    }
    revalidatePath('/admin/inventory');
    return { success: true, message: 'Inventory item deleted successfully.' };
}