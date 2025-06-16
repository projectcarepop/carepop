import { supabase } from '@/config/supabaseClient';
import { Database } from '@/types/supabase.types';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';
import { PostgrestError } from '@supabase/postgrest-js';
import logger from '@/utils/logger';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type CreateAppointmentDto = Database['public']['Tables']['appointments']['Insert'];
type UpdateAppointmentDto = Database['public']['Tables']['appointments']['Update'];

type AppointmentRpcResponse = {
  id: string;
  appointment_datetime: string;
  status: string;
  user_first_name: string;
  user_last_name: string;
  user_email: string;
  service_name: string;
  service_cost: number;
  clinic_name: string;
  provider_full_name: string;
};

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
    const { page = 1, limit = 10, search, clinicId, providerId, status, startDate, endDate, sortBy = 'appointment_datetime', sortOrder = 'desc' } = options;

    const rpcParams: { [key: string]: any } = { search_term: search };
    if (clinicId) rpcParams.p_clinic_id = clinicId;
    if (providerId) rpcParams.p_provider_id = providerId;
    if (status) rpcParams.p_status = status;
    if (startDate) rpcParams.p_start_date = startDate;
    if (endDate) rpcParams.p_end_date = endDate;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // The RPC function now returns total_count, so we make one call.
    const { data, error: queryError } = await supabase
      .rpc('search_appointments', rpcParams)
      .range(from, to)
      .order(sortBy, { ascending: sortOrder === 'desc' ? false : true });

    if (queryError) this.handleError(queryError, 'findAll (query)');

    const count = data?.[0]?.total_count ?? 0;
    
    return {
      data,
      count
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