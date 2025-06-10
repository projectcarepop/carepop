import { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';
import { supabaseServiceRole } from '@/config/supabaseClient';
import { Database } from '@/types/supabase.types';

const supabase: SupabaseClient<Database> = supabaseServiceRole;

export const createReport = async (appointmentId: string, adminId: string, reportContent: string) => {
  const { data, error } = await supabase
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
};

export const getReportsForAppointment = async (appointmentId: string) => {
  const { data, error } = await supabase
    .from('appointment_reports')
    .select('*')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch reports', StatusCodes.INTERNAL_SERVER_ERROR);
  }
  return data;
};

export const updateReport = async (reportId: string, reportContent: string) => {
  const { data, error } = await supabase
    .from('appointment_reports')
    .update({ report_content: reportContent, updated_at: new Date().toISOString() })
    .eq('id', reportId)
    .select()
    .single();

  if (error) {
    throw new AppError('Failed to update report', StatusCodes.INTERNAL_SERVER_ERROR);
  }
  return data;
}; 