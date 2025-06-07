import { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../../utils/errors';
import { StatusCodes } from 'http-status-codes';

export class ReportAdminService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async createReport(appointmentId: string, adminId: string, reportContent: string) {
    const { data, error } = await this.supabase
      .from('appointment_reports')
      .insert({
        appointment_id: appointmentId,
        created_by_admin_id: adminId,
        report_content: reportContent,
      })
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create report', StatusCodes.INTERNAL_SERVER_ERROR);
    }
    return data;
  }

  async getReportsForAppointment(appointmentId: string) {
    const { data, error } = await this.supabase
      .from('appointment_reports')
      .select('*')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch reports', StatusCodes.INTERNAL_SERVER_ERROR);
    }
    return data;
  }

  async updateReport(reportId: string, reportContent: string) {
    const { data, error } = await this.supabase
      .from('appointment_reports')
      .update({ report_content: reportContent, updated_at: new Date() })
      .eq('id', reportId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update report', StatusCodes.INTERNAL_SERVER_ERROR);
    }
    return data;
  }
} 