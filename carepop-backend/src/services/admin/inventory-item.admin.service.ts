import { SupabaseClient } from '@supabase/supabase-js';
import { IInventoryItem } from '../../types/inventory-item.interface';
import { Database } from '../../types/supabase.types';

type InventoryItemData = Omit<IInventoryItem, 'id' | 'created_at' | 'updated_at'>;

export class InventoryItemAdminService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getAllInventoryItems(): Promise<IInventoryItem[]> {
    const { data, error } = await this.supabase
      .from('inventory_items')
      .select(`
        *,
        supplier:suppliers(id, name)
      `)
      .order('item_name', { ascending: true });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getInventoryItemById(id: string): Promise<IInventoryItem | null> {
    const { data, error } = await this.supabase
      .from('inventory_items')
      .select(`
        *,
        supplier:suppliers(id, name)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async createInventoryItem(itemData: InventoryItemData): Promise<IInventoryItem> {
    const { data, error } = await this.supabase
      .from('inventory_items')
      .insert(itemData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateInventoryItem(id: string, itemData: Partial<InventoryItemData>): Promise<IInventoryItem> {
    const { data, error } = await this.supabase
      .from('inventory_items')
      .update({ ...itemData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return data;
  }

  async deleteInventoryItem(id: string): Promise<{ message: string }> {
    const { error } = await this.supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Inventory item deleted successfully.' };
  }
} 