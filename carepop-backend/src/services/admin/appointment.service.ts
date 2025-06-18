import { supabase } from '@/config/supabaseClient';
import { Database } from '@/types/supabase.types';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';
import { PostgrestError } from '@supabase/postgrest-js';
import logger from '@/utils/logger';
import { SupabaseClient } from '@supabase/supabase-js';
import { IAppointmentReport } from '../../types/appointment-report.interface';
import { AppointmentReportAdminService } from './appointment-report.admin.service';

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
    const { page = 1, limit = 10, search, clinicId, providerId, userId, status, startDate, endDate, sortBy = 'appointment_datetime', sortOrder = 'desc' } = options;

    const rpcParams: { [key: string]: any } = { search_term: search };
    if (clinicId) rpcParams.p_clinic_id = clinicId;
    if (providerId) rpcParams.p_provider_id = providerId;
    if (userId) rpcParams.p_user_id = userId;
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

/**
 * Finds a report by appointment ID.
 * @param appointmentId - The ID of the appointment.
 * @returns The appointment report or null if not found.
 */
export async function findReportByAppointmentId(appointmentId: string, supabase: SupabaseClient): Promise<IAppointmentReport | null> {
    const reportService = new AppointmentReportAdminService(supabase);
    return reportService.getReportByAppointmentId(appointmentId);
}

/**
 * Creates or updates an appointment report.
 * If the report has an ID, it updates the existing report.
 * Otherwise, it creates a new one.
 * @param reportData - The data for the report.
 * @returns The created or updated appointment report.
 */
export async function upsertAppointmentReport(reportData: Partial<IAppointmentReport>, adminId: string, supabase: SupabaseClient): Promise<IAppointmentReport> {
    const reportService = new AppointmentReportAdminService(supabase);
    
    const { id, created_at, updated_at, ...payload } = reportData;

    if (id) {
        // Update is fine, it doesn't need the admin ID.
        return reportService.updateAppointmentReport(id, payload);
    } else {
        // Create a new report, bypassing the broken service method
        const { data: newReport, error } = await supabase
            .from('appointment_reports')
            .insert({
                ...payload,
                appointment_id: payload.appointment_id!,
                created_by_admin_id: adminId,
                report_content: payload.report_content || '',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating report directly:', error);
            throw new Error('Could not create appointment report.');
        }
        return newReport;
    }
} 