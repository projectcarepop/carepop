import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { IInventoryItem } from '../../types/inventory-item.interface';
import { Database } from '../../types/supabase.types';

type InventoryItemData = Omit<IInventoryItem, 'id' | 'created_at' | 'updated_at'>;

export class InventoryItemAdminService {
  private serviceRoleSupabase: SupabaseClient<Database>;

  constructor(private supabase: SupabaseClient<Database>) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
    }
    // This client uses the service_role key to bypass RLS for admin operations
    this.serviceRoleSupabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

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
    const { data, error } = await this.serviceRoleSupabase
      .from('inventory_items')
      .insert(itemData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async updateInventoryItem(id: string, itemData: Partial<InventoryItemData>): Promise<void> {
    const { error } = await this.serviceRoleSupabase
      .from('inventory_items')
      .update({ ...itemData, updated_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw new Error(error.message);
  }

  async deleteInventoryItem(id: string): Promise<{ message: string }> {
    const { error } = await this.serviceRoleSupabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { message: 'Inventory item deleted successfully.' };
  }
} 