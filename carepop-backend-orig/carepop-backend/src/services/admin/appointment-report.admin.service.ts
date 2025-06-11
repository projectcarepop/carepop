import { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../../utils/errors';
import { StatusCodes } from 'http-status-codes';
import { IAppointmentReport } from '../../types/appointment-report.interface';

export class AppointmentReportAdminService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getReportByAppointmentId(appointmentId: string): Promise<IAppointmentReport | null> {
    const { data, error } = await this.supabase
      .from('appointment_reports')
      .select('*')
      .eq('appointment_id', appointmentId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching appointment report:', error);
      throw new AppError('Failed to fetch appointment report', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return data;
  }

  async createAppointmentReport(reportData: Omit<IAppointmentReport, 'id' | 'created_at' | 'updated_at'>): Promise<IAppointmentReport> {
    const { data, error } = await this.supabase
      .from('appointment_reports')
      .insert([reportData])
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment report:', error);
      throw new AppError('Failed to create appointment report', StatusCodes.CONFLICT);
    }

    return data;
  }

  async updateAppointmentReport(reportId: string, reportData: Partial<IAppointmentReport>): Promise<IAppointmentReport> {
    const { data, error } = await this.supabase
      .from('appointment_reports')
      .update(reportData)
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      console.error('Error updating appointment report:', error);
      throw new AppError('Failed to update appointment report', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return data;
  }
} 