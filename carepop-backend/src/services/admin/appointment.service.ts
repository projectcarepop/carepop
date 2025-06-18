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
export async function upsertAppointmentReport(reportData: Partial<IAppointmentReport>, supabase: SupabaseClient): Promise<IAppointmentReport> {
    const reportService = new AppointmentReportAdminService(supabase);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, updated_at, ...payload } = reportData;

    if (id) {
        return reportService.updateAppointmentReport(id, payload);
    } else {
        // The service expects a more complete object for creation.
        // The created_by_admin_id will be added in the controller from the authenticated user.
        const createPayload: Omit<IAppointmentReport, 'id' | 'created_at' | 'updated_at'> = {
            appointment_id: payload.appointment_id!,
            // Add other non-nullable fields here with default values if necessary
            purpose_of_visit: payload.purpose_of_visit ?? null,
            symptoms_reported: payload.symptoms_reported ?? null,
            vitals_blood_pressure: payload.vitals_blood_pressure ?? null,
            vitals_temperature: payload.vitals_temperature ?? null,
            vitals_weight: payload.vitals_weight ?? null,
            vitals_height: payload.vitals_height ?? null,
            vitals_other: payload.vitals_other ?? null,
            findings_summary: payload.findings_summary ?? null,
            diagnoses: payload.diagnoses ?? null,
            recommendations_summary: payload.recommendations_summary ?? null,
            treatment_plan: payload.treatment_plan ?? null,
            lifestyle_recommendations: payload.lifestyle_recommendations ?? null,
            medications_prescribed: payload.medications_prescribed ?? null,
            tests_ordered: payload.tests_ordered ?? null,
            referrals: payload.referrals ?? null,
            follow_up_date: payload.follow_up_date ?? null,
            follow_up_notes: payload.follow_up_notes ?? null,
            additional_notes: payload.additional_notes ?? null,
            report_content: payload.report_content ?? null,
        };
        return reportService.createAppointmentReport(createPayload);
    }
} 