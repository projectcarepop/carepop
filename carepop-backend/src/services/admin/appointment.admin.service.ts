import { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../../utils/errors';
import { Database } from '../../types/supabase.types';

type Appointment = Database['public']['Tables']['appointments']['Row'];

export class AppointmentAdminService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async confirmAppointment(appointmentId: string): Promise<Appointment> {
    // First, fetch the appointment to check its current status
    const { data: existingAppointment, error: fetchError } = await this.supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !existingAppointment) {
      throw new AppError('Appointment not found.', 404);
    }

    // Check if the appointment is already confirmed or in another non-pending state
    if (existingAppointment.status !== 'pending_confirmation') {
      throw new AppError(`Appointment cannot be confirmed. Current status: ${existingAppointment.status}`, 409); // 409 Conflict
    }

    // Update the appointment status to 'confirmed'
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

  async listAllAppointments(): Promise<any[]> { // Return type changed to any[] to match the new query structure
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        id,
        status,
        appointment_datetime,
        profile:profiles ( full_name ),
        clinic:clinics ( name ),
        service:services ( name ),
        provider:providers ( first_name, last_name )
      `)
      .order('appointment_datetime', { ascending: false });

    if (error) {
      console.error('Error fetching appointments:', error);
      throw new AppError('Failed to fetch appointments.', 500);
    }

    return data || [];
  }
}
