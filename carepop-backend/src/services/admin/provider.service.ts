import { supabaseServiceRole } from '../../config/supabaseClient';
import { Database } from '../../types/supabase.types';
import { AppError } from '../../lib/utils/appError';
import { StatusCodes } from 'http-status-codes';
import { PostgrestError } from '@supabase/postgrest-js';
import logger from '../../utils/logger';

type Provider = Database['public']['Tables']['providers']['Row'];
type CreateProviderDto = Database['public']['Tables']['providers']['Insert'];
type UpdateProviderDto = Database['public']['Tables']['providers']['Update'];

export class ProviderAdminService {
  private tableName = 'providers' as const;

  private handleError(error: PostgrestError, context: string): never {
    logger.error(`Supabase error in ${this.tableName} service (${context}):`, error);
    if (error.code === '23505') { // unique_violation, likely on email
      throw new AppError(`A provider with this email already exists.`, StatusCodes.CONFLICT);
    }
    throw new AppError(`Database operation failed: ${context}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  async create(createDto: CreateProviderDto): Promise<Provider> {
    if (!supabaseServiceRole) {
      throw new AppError('Service client not available', StatusCodes.INTERNAL_SERVER_ERROR);
    }
    const { data, error } = await supabaseServiceRole
      .from(this.tableName)
      .insert(createDto)
      .select()
      .single();

    if (error) this.handleError(error, 'create');
    return data;
  }
  
  async findAll(options: { page: number, limit: number, search?: string, clinicId?: string, sortBy: string, sortOrder: 'asc' | 'desc' }) {
    if (!supabaseServiceRole) {
      throw new AppError('Service client not available', StatusCodes.INTERNAL_SERVER_ERROR);
    }
    const { page, limit, search, clinicId, sortBy, sortOrder } = options;
    
    const rpcParams = { 
      search_term: search,
      p_clinic_id: clinicId 
    };

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // The RPC function now returns total_count, so we make one call.
    const { data, error: queryError } = await supabaseServiceRole
      .rpc('search_providers', rpcParams)
      .range(from, to)
      .order(sortBy, { ascending: sortOrder === 'desc' ? false : true });

    if (queryError) this.handleError(queryError, 'findAll (query)');
    
    const providers = data || [];
    const totalItems = providers?.[0]?.total_count ?? 0;
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      data: providers,
      meta: { totalItems, itemsPerPage: limit, currentPage: page, totalPages },
    };
  }

  async findOne(id: string): Promise<Provider | null> {
    if (!supabaseServiceRole) {
      throw new AppError('Service client not available', StatusCodes.INTERNAL_SERVER_ERROR);
    }
    const { data, error } = await supabaseServiceRole
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) this.handleError(error, 'findOne');
    return data;
  }

  async update(id: string, updateDto: UpdateProviderDto): Promise<Provider | null> {
    if (!supabaseServiceRole) {
      throw new AppError('Service client not available', StatusCodes.INTERNAL_SERVER_ERROR);
    }
    const { data, error } = await supabaseServiceRole
      .from(this.tableName)
      .update(updateDto)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'update');
    return data;
  }

  async remove(id: string): Promise<void> {
    if (!supabaseServiceRole) {
      throw new AppError('Service client not available', StatusCodes.INTERNAL_SERVER_ERROR);
    }
    const { error } = await supabaseServiceRole
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'remove');
  }
} 