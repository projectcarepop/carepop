import { supabase } from '@/config/supabaseClient';
import { Database } from '@/types/supabase.types';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';
import { PostgrestError } from '@supabase/postgrest-js';
import logger from '@/utils/logger';

type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];
type CreateInventoryDto = Database['public']['Tables']['inventory_items']['Insert'];
type UpdateInventoryDto = Database['public']['Tables']['inventory_items']['Update'];

export class InventoryAdminService {
  private tableName = 'inventory_items' as const;

  private handleError(error: PostgrestError, context: string): never {
    logger.error(`Supabase error in ${this.tableName} service (${context}):`, error);
    if (error.code === '23505') {
      throw new AppError(`An inventory item with this value already exists.`, StatusCodes.CONFLICT);
    }
    throw new AppError(`Database operation failed: ${context}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  async create(createDto: CreateInventoryDto): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(createDto)
      .select()
      .single();

    if (error) this.handleError(error, 'create');
    return data;
  }
  
  async findAll(options: { page: number, limit: number, search?: string, sortBy: string, sortOrder: 'asc' | 'desc' }) {
    const { page, limit, search, sortBy, sortOrder } = options;
    
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('item_name', `%${search}%`);
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1)
                 .order(sortBy, { ascending: sortOrder === 'asc' });

    const { data, error, count } = await query;
    if (error) this.handleError(error, 'findAll');
    
    const totalItems = count ?? 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: data || [],
      meta: { totalItems, itemsPerPage: limit, currentPage: page, totalPages },
    };
  }

  async findOne(id: string): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) this.handleError(error, 'findOne');
    return data;
  }

  async update(id: string, updateDto: UpdateInventoryDto): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateDto)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'update');
    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'remove');
  }
} 