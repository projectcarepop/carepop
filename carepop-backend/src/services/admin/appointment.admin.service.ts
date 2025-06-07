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

  async getAllAppointments(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        id,
        status,
        appointment_datetime,
        created_at,
        user_id,
        clinic:clinic_id ( name ),
        service:service_id ( name ),
        provider:provider_id ( first_name, last_name )
      `);

    if (error) {
      console.error('Error fetching appointments:', error);
      throw new AppError('Failed to fetch appointments from the database.', 500);
    }
    
    // The profiles table is not directly joined, so we'll have to fetch them separately if needed,
    // or adjust the query if a direct view/function is created.
    // For now, we will just return the user_id.

    return data?.map(a => ({
      ...a,
      clinic_name: a.clinic?.name || 'N/A',
      service_name: a.service?.name || 'N/A',
      provider_name: a.provider ? `${a.provider.first_name} ${a.provider.last_name}`.trim() : 'N/A'
    })) || [];
  }
}
