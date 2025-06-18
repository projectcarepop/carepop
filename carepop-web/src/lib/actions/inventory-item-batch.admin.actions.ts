'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { batchFormSchema } from '../validation/inventory-item-batch.validation';

export async function createInventoryItemBatch(values: z.infer<typeof batchFormSchema>) {
    const supabase = createSupabaseServerClient();

    const validatedData = batchFormSchema.parse(values);
    
    // TODO: Add a transaction to update inventory_items.quantity_on_hand
    const { error } = await supabase.from('inventory_item_batches').insert([validatedData]);

    if (error) {
        return { success: false, message: `Failed to create batch: ${error.message}` };
    }
    revalidatePath(`/admin/inventory/items/${validatedData.item_id}`);
    return { success: true, message: 'Batch created successfully.' };
}

export async function updateInventoryItemBatch(batchId: string, values: z.infer<typeof batchFormSchema>) {
    const supabase = createSupabaseServerClient();

    const { item_id, ...updateData } = batchFormSchema.parse(values);

    // TODO: Add a transaction to update inventory_items.quantity_on_hand
    const { error } = await supabase.from('inventory_item_batches').update(updateData).eq('id', batchId);
    
    if (error) {
        return { success: false, message: `Failed to update batch: ${error.message}` };
    }
    revalidatePath(`/admin/inventory/items/${item_id}`);
    return { success: true, message: 'Batch updated successfully.' };
}

export async function deleteInventoryItemBatch(batchId: string, itemId: string) {
    const supabase = createSupabaseServerClient();

    // TODO: Add a transaction to update inventory_items.quantity_on_hand
    const { error } = await supabase.from('inventory_item_batches').delete().eq('id', batchId);

    if (error) {
        return { success: false, message: 'Failed to delete batch.' };
    }
    revalidatePath(`/admin/inventory/items/${itemId}`); 
    return { success: true, message: 'Batch deleted successfully.' };
} 