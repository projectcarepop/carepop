import { supabase } from '@/config/supabaseClient';
import { Database } from '@/types/supabase.types';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';
import { PostgrestError } from '@supabase/postgrest-js';
import logger from '@/utils/logger';

type Supplier = Database['public']['Tables']['suppliers']['Row'];
type CreateSupplierDto = Database['public']['Tables']['suppliers']['Insert'];
type UpdateSupplierDto = Database['public']['Tables']['suppliers']['Update'];

export class SupplierAdminService {
  private readonly TABLE_NAME = 'suppliers';

  private handleError(error: PostgrestError, context: string): never {
    logger.error(`Supabase error in ${this.TABLE_NAME} service (${context}):`, error);
    if (error.code === '23505') {
      throw new AppError(`A supplier with this value already exists.`, StatusCodes.CONFLICT);
    }
    throw new AppError(`Database operation failed: ${context}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  async create(createDto: CreateSupplierDto): Promise<Supplier> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .insert(createDto)
      .select()
      .single();

    if (error) this.handleError(error, 'create');
    return data;
  }
  
  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    clinic_id?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 10, search, clinic_id, sortBy = 'name', sortOrder = 'asc' } = options;
    
    const rpcParams = {
        search_term: search,
        p_clinic_id: clinic_id,
    };

    const { count, error: countError } = await supabase
      .rpc('search_suppliers', rpcParams, { count: 'exact' });
      
    if (countError) this.handleError(countError, 'findAll (count)');

    const totalItems = count ?? 0;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;

    const { data, error } = await supabase
      .rpc('search_suppliers', rpcParams)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (error) this.handleError(error, 'findAll (data)');

    return {
      data: data || [],
      meta: { totalItems, itemsPerPage: limit, currentPage: page, totalPages },
    };
  }

  async findOne(id: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) this.handleError(error, 'findOne');
    return data;
  }

  async update(id: string, updateDto: UpdateSupplierDto): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from(this.TABLE_NAME)
      .update(updateDto)
      .eq('id', id)
      .select()
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