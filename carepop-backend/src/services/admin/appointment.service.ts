import { supabase } from '@/config/supabaseClient';
import { Database } from '@/types/supabase.types';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';
import { PostgrestError } from '@supabase/postgrest-js';
import logger from '@/utils/logger';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type CreateAppointmentDto = Database['public']['Tables']['appointments']['Insert'];
type UpdateAppointmentDto = Database['public']['Tables']['appointments']['Update'];

const APPOINTMENT_SELECT_QUERY = `
    *,
    user:users_view(*),
    service:services(name, cost),
    clinic:clinics(name),
    provider:providers(full_name)
`;

export class AppointmentAdminService {
  private tableName = 'appointments' as const;

  private handleError(error: PostgrestError, context: string): never {
    logger.error(`Supabase error in ${this.tableName} service (${context}):`, error);
    if (error.code === '23503') { // foreign_key_violation
        throw new AppError(`Invalid ID provided (user, service, clinic, or provider).`, StatusCodes.BAD_REQUEST);
    }
    throw new AppError(`Database operation failed: ${context}`, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  async create(createDto: CreateAppointmentDto): Promise<Appointment> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(createDto)
      .select(APPOINTMENT_SELECT_QUERY)
      .single();

    if (error) this.handleError(error, 'create');
    return data as Appointment;
  }
  
  async findAll(options: any) {
    const { page, limit, search, clinic_id, provider_id, status, date_range_start, date_range_end, sortBy, sortOrder } = options;
    
    let query = supabase
      .from(this.tableName)
      .select(APPOINTMENT_SELECT_QUERY, { count: 'exact' });

    if (search) {
      query = query.ilike('users_view.first_name', `%${search}%`); // This requires a join, RPC may be better
    }
    if (clinic_id) query = query.eq('clinic_id', clinic_id);
    if (provider_id) query = query.eq('provider_id', provider_id);
    if (status) query = query.eq('status', status);
    if (date_range_start) query = query.gte('appointment_datetime', date_range_start);
    if (date_range_end) query = query.lte('appointment_datetime', date_range_end);
    
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

  async findOne(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(APPOINTMENT_SELECT_QUERY)
      .eq('id', id)
      .maybeSingle();

    if (error) this.handleError(error, 'findOne');
    return data as Appointment | null;
  }

  async update(id: string, updateDto: UpdateAppointmentDto): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateDto)
      .eq('id', id)
      .select(APPOINTMENT_SELECT_QUERY)
      .single();

    if (error) this.handleError(error, 'update');
    return data as Appointment | null;
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'remove');
  }
} 