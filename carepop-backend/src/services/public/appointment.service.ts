import { supabase } from '@/config/supabaseClient';
import { AppError } from '@/lib/utils/appError';

export class AppointmentService {

    public async getFutureAppointmentsByUserId(userId: string) {
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                clinic:clinics (*),
                provider:providers (*),
                service:services (*)
            `)
            .eq('user_id', userId)
            .gte('appointment_datetime', now)
            .order('appointment_datetime', { ascending: true });

        if (error) {
            throw new AppError(`Supabase error fetching future appointments: ${error.message}`, 500);
        }
        return data;
    }

    public async getPastAppointmentsByUserId(userId: string) {
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('appointments')
            .select(`
                *,
                clinic:clinics (*),
                provider:providers (*),
                service:services (*)
            `)
            .eq('user_id', userId)
            .lt('appointment_datetime', now)
            .order('appointment_datetime', { ascending: false });

        if (error) {
            throw new AppError(`Supabase error fetching past appointments: ${error.message}`, 500);
        }
        return data;
    }

    public async cancelAppointment(appointmentId: string, userId: string) {
        // First, verify the appointment exists and belongs to the user.
        const { data: existingAppointment, error: fetchError } = await supabase
            .from('appointments')
            .select('id, status')
            .eq('id', appointmentId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !existingAppointment) {
            throw new AppError('Appointment not found or you do not have permission to cancel it.', 404);
        }

        if (existingAppointment.status !== 'confirmed' && existingAppointment.status !== 'pending_confirmation') {
             throw new AppError('This appointment cannot be cancelled.', 400);
        }

        // Now, update the status.
        const { data, error } = await supabase
            .from('appointments')
            .update({ status: 'cancelled_by_user', updated_at: new Date().toISOString() })
            .eq('id', appointmentId)
            .select()
            .single();

        if (error) {
            throw new AppError(`Supabase error cancelling appointment: ${error.message}`, 500);
        }

        return data;
    }
} 