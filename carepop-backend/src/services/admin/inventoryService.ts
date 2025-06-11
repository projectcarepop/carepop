import { supabaseServiceRole } from '../../config/supabaseClient';
import { createInventoryItemSchema, updateInventoryItemSchema } from '../../validation/admin/inventory-item.admin.validation';
import { z } from 'zod';
import { AppError } from '../../utils/errors';

const TABLE_NAME = 'inventory_items';

type CreateInventoryItemDTO = z.infer<typeof createInventoryItemSchema>;
type UpdateInventoryItemDTO = z.infer<typeof updateInventoryItemSchema>;

export const inventoryService = {
  create: async (itemData: CreateInventoryItemDTO) => {
    const { data, error } = await supabaseServiceRole
      .from(TABLE_NAME)
      .insert(itemData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating inventory item:', error);
      throw new AppError('Failed to create inventory item.', 500);
    }
    return data;
  },

  getAll: async (searchQuery?: string) => {
    let query = supabaseServiceRole.from(TABLE_NAME).select('*');
    if (searchQuery) {
      query = query.ilike('item_name', `%${searchQuery}%`);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Supabase error fetching inventory items:', error);
      throw new AppError('Failed to fetch inventory items.', 500);
    }
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabaseServiceRole
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
        if (error.code === 'PGRST116') { // PostgREST error code for "Not Found"
            throw new AppError('Inventory item not found.', 404);
        }
        console.error(`Supabase error fetching item with id ${id}:`, error);
        throw new AppError('Failed to fetch inventory item.', 500);
    }
    return data;
  },

  update: async (id: string, itemData: UpdateInventoryItemDTO) => {
    const { data, error } = await supabaseServiceRole
      .from(TABLE_NAME)
      .update(itemData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
        if (error.code === 'PGRST116') {
            throw new AppError('Inventory item not found.', 404);
        }
        console.error(`Supabase error updating item with id ${id}:`, error);
        throw new AppError('Failed to update inventory item.', 500);
    }
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabaseServiceRole
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Supabase error deleting item with id ${id}:`, error);
      throw new AppError('Failed to delete inventory item.', 500);
    }
    return { message: 'Inventory item deleted successfully.' };
  },
}; 