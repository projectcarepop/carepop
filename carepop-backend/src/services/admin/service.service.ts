import { supabase } from '@/config/supabaseClient';
import { Database } from '@/types/supabase.types';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';
import { PostgrestError } from '@supabase/postgrest-js';
import logger from '@/utils/logger';

type Service = Database['public']['Tables']['services']['Row'];
type CreateServiceDto = Database['public']['Tables']['services']['Insert'];
type UpdateServiceDto = Database['public']['Tables']['services']['Update'];

export class ServiceAdminService {
  private tableName = 'services' as const;

  private handleError(error: PostgrestError, context: string): never {
    logger.error(`Supabase error in ${this.tableName} service (${context}):`, error);
    if (error.code === '23505') { 
      throw new AppError(`A service with this name already exists.`, StatusCodes.CONFLICT);
    }
    if (error.code === '23503') { // foreign_key_violation
        throw new AppError(`Invalid category ID provided.`, StatusCodes.BAD_REQUEST);
    }
    throw new AppError(`Database operation failed: ${context}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  async create(createDto: CreateServiceDto): Promise<Service> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(createDto)
      .select()
      .single();

    if (error) this.handleError(error, 'create');
    return data;
  }
  
  async findAll(options: { page: number; limit: number; search?: string; category_id?: string; sortBy: string; sortOrder: 'asc' | 'desc' }) {
    const { page, limit, search, category_id, sortBy, sortOrder } = options;
    
    let query = supabase
      .from(this.tableName)
      .select('*, service_categories(name)', { count: 'exact' });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (category_id) {
        query = query.eq('category_id', category_id);
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

  async findOne(id: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*, service_categories(id, name)')
      .eq('id', id)
      .maybeSingle();

    if (error) this.handleError(error, 'findOne');
    return data as Service | null;
  }

  async update(id: string, updateDto: UpdateServiceDto): Promise<Service | null> {
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