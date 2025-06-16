import { Database } from './supabase.types';

export type InventoryItem = Database['public']['Tables']['inventory_items']['Row'] & {
  category?: { name: string } | null;
  supplier?: { name: string } | null;
  clinic?: { name: string } | null;
};

export type CreateInventoryDto = Database['public']['Tables']['inventory_items']['Insert'];
export type UpdateInventoryDto = Database['public']['Tables']['inventory_items']['Update']; 