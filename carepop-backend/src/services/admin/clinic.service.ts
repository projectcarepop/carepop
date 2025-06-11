import { supabase } from '@/config/supabaseClient';
import { Database } from '@/types/supabase.types';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';
import { PostgrestError } from '@supabase/postgrest-js';
import logger from '@/utils/logger';

type Clinic = Database['public']['Tables']['clinics']['Row'];
type CreateClinicDto = Database['public']['Tables']['clinics']['Insert'];
type UpdateClinicDto = Database['public']['Tables']['clinics']['Update'];

export class ClinicAdminService {
  private tableName = 'clinics' as const;

  private handleError(error: PostgrestError | { message: string }, context: string): never {
    logger.error(`Error in ${this.tableName} service (${context}):`, error);
    if ('code' in error && error.code === '23505') {
      throw new AppError(`A clinic with this name already exists.`, StatusCodes.CONFLICT);
    }
    throw new AppError(error.message || `Database operation failed: ${context}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  
  private async geocodeAddress(address: string): Promise<{ latitude: number, longitude: number} | null> {
      const { data, error } = await supabase.functions.invoke('geocode-address', {
          body: { address },
      });

      if (error) {
          logger.error('Geocoding function error:', error);
          // Don't block clinic creation if geocoding fails
          return null; 
      }
      return data;
  }

  async create(createDto: CreateClinicDto): Promise<Clinic> {
    if ((!createDto.latitude || !createDto.longitude) && createDto.full_address) {
        const coords = await this.geocodeAddress(createDto.full_address);
        if (coords) {
            createDto.latitude = coords.latitude;
            createDto.longitude = coords.longitude;
        }
    }
  
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(createDto)
      .select()
      .single();

    if (error) this.handleError(error, 'create');
    return data;
  }
  
  async findAll(options: { page: number, limit: number, search?: string, sortBy: string, sortOrder: 'asc' | 'desc' }) {
    // ... same as previous services ...
    const { page, limit, search, sortBy, sortOrder } = options;
    
    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,full_address.ilike.%${search}%`);
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

  async findOne(id: string): Promise<Clinic | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) this.handleError(error, 'findOne');
    return data;
  }

  async update(id: string, updateDto: UpdateClinicDto): Promise<Clinic | null> {
    if ((!updateDto.latitude || !updateDto.longitude) && updateDto.full_address) {
        const coords = await this.geocodeAddress(updateDto.full_address);
        if (coords) {
            updateDto.latitude = coords.latitude;
            updateDto.longitude = coords.longitude;
        }
    }
  
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // If the error is "No rows found", it means the ID didn't match.
      if (error.code === 'PGRST116') {
        return null; 
      }
      this.handleError(error, 'update');
    }
    
    // If we get here, data should be the updated clinic object.
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