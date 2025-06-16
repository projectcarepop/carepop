import { supabase } from '@/config/supabaseClient';
import { Database } from '@/types/supabase.types';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';
import { PostgrestError } from '@supabase/postgrest-js';
import logger from '@/utils/logger';

type InventoryItem = Database['public']['Tables']['inventory_items']['Row'] & {
  category?: { name: string } | null;
  supplier?: { name: string } | null;
  clinic?: { name: string } | null;
};
type CreateInventoryDto = Database['public']['Tables']['inventory_items']['Insert'];
type UpdateInventoryDto = Database['public']['Tables']['inventory_items']['Update'];

const INVENTORY_ITEM_SELECT_QUERY = `
  *,
  category:inventory_categories(name),
  supplier:suppliers(name),
  clinic:clinics(name)
`;

type InventoryItemRpcResponse = {
  id: string; name: string; description: string; sku: string; stock_quantity: number;
  reorder_level: number; cost_per_unit: number; clinic_id: string; category_id: string;
  supplier_id: string; created_at: string; updated_at: string; category_name: string;
  supplier_name: string; clinic_name: string;
};

export class InventoryAdminService {
  private readonly TABLE_NAME = 'inventory_items';

  private handleError(error: PostgrestError, context: string): never {
    logger.error(`Supabase error in ${this.TABLE_NAME} service (${context}):`, error);
    if (error.code === '23505') {
      throw new AppError(`An inventory item with this value already exists.`, StatusCodes.CONFLICT);
    }
    throw new AppError(`Database operation failed: ${context}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  async create(createDto: CreateInventoryDto): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert(createDto)
      .select(INVENTORY_ITEM_SELECT_QUERY)
      .single();

    if (error) this.handleError(error, 'create');
    return data;
  }
  
  async findAll(options: {
    page?: number; limit?: number; search?: string; clinic_id?: string;
    category_id?: string; supplier_id?: string; stock_level_threshold?: number;
    sortBy?: string; sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 10, search, clinic_id, category_id, supplier_id, stock_level_threshold, sortBy = 'name', sortOrder = 'asc' } = options;
    
    const rpcParams = {
        search_term: search, p_clinic_id: clinic_id, p_category_id: category_id,
        p_supplier_id: supplier_id, p_stock_level_threshold: stock_level_threshold
    };

    const { count, error: countError } = await supabase
      .rpc('search_inventory_items', rpcParams, { count: 'exact' });
      
    if (countError) this.handleError(countError, 'findAll (count)');

    const totalItems = count ?? 0;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;

    const { data: rpcData, error } = await supabase
      .rpc('search_inventory_items', rpcParams)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) this.handleError(error, 'findAll (data)');
    
    const data = rpcData as InventoryItemRpcResponse[] | null;

    const formattedData = data?.map(item => ({
      ...item,
      category: { name: item.category_name },
      supplier: { name: item.supplier_name },
      clinic: { name: item.clinic_name }
    })) || [];

    return {
      data: formattedData,
      meta: { totalItems, itemsPerPage: limit, currentPage: page, totalPages },
    };
  }

  async findOne(id: string): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select(INVENTORY_ITEM_SELECT_QUERY)
      .eq('id', id)
      .maybeSingle();

    if (error) this.handleError(error, 'findOne');
    return data;
  }

  async update(id: string, updateDto: UpdateInventoryDto): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update(updateDto)
      .eq('id', id)
      .select(INVENTORY_ITEM_SELECT_QUERY)
      .single();

    if (error) this.handleError(error, 'update');
    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'remove');
  }
} 