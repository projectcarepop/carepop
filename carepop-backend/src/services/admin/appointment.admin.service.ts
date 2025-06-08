import { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../../utils/errors';
import { Database } from '../../types/supabase.types';
import { supabaseServiceRole } from '../../config/supabaseClient';

export class AppointmentAdminService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = supabaseServiceRole;
  }

  async confirmAppointment(appointmentId: string): Promise<Database['public']['Tables']['appointments']['Row']> {
    const { data: existingAppointment, error: fetchError } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !existingAppointment) {
      throw new AppError('Appointment not found.', 404);
    }

    if (existingAppointment.status !== 'pending_confirmation') {
      throw new AppError(`Appointment cannot be confirmed. Current status: ${existingAppointment.status}`, 409);
    }

    const { data: updatedAppointment, error: updateError } = await this.supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', appointmentId)
      .select()
      .single();

    if (updateError) {
      throw new AppError('Failed to confirm appointment.', 500);
    }

    return updatedAppointment;
  }

  async cancelAppointment(appointmentId: string, reason: string): Promise<Database['public']['Tables']['appointments']['Row']> {
    const { data: existingAppointment, error: fetchError } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !existingAppointment) {
      throw new AppError('Appointment not found.', 404);
    }
    
    const cancellableStatuses = ['pending_confirmation', 'confirmed'];
    if (!cancellableStatuses.includes(existingAppointment.status)) {
        throw new AppError(`Appointment cannot be cancelled. Current status: ${existingAppointment.status}`, 409);
    }

    const { data: updatedAppointment, error: updateError } = await this.supabase
      .from('appointments')
      .update({ 
          status: 'cancelled_by_clinic',
          notes_clinic: `Cancelled by admin. Reason: ${reason}` 
      })
      .eq('id', appointmentId)
      .select('*')
      .single();

    if (updateError) {
      throw new AppError('Failed to cancel appointment.', 500);
    }

    // TODO: Implement a robust email notification service
    console.log(`--- EMAIL NOTIFICATION ---`);
    console.log(`TO: User ID ${updatedAppointment.user_id}`);
    console.log(`SUBJECT: Your appointment has been cancelled`);
    console.log(`BODY: Your appointment has been cancelled by the clinic. Reason: "${reason}"`);
    console.log(`--------------------------`);

    return updatedAppointment;
  }

  async getAllAppointments(clinicId?: string): Promise<any[]> {
    let query = this.supabase
      .from('appointments')
      .select(`
        id,
        status,
        appointment_datetime,
        created_at,
        user_id,
        clinic_id,
        service_id,
        provider_id
      `);

    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching appointments:', error);
      throw new AppError('Failed to fetch appointments from the database.', 500);
    }
    
    return data || [];
  }

  async getAppointmentReport(appointmentId: string): Promise<Database['public']['Tables']['appointment_reports']['Row'] | null> {
    const { data, error } = await this.supabase
      .from('appointment_reports')
      .select('*')
      .eq('appointment_id', appointmentId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching appointment report:', error);
      throw new AppError('Failed to fetch appointment report from the database.', 500);
    }

    return data;
  }
}
