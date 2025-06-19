import { supabase } from '../../config/supabaseClient';
import { AppError } from '../../lib/utils/appError';
import { AuthenticatedRequest } from '../../controllers/public/appointment.controller';
import { getProviderAvailability } from './availability.service';

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

    public async createAppointment(details: { patientId: string, providerId: string, serviceId: string, startTime: string }) {
        const { patientId, providerId, serviceId, startTime } = details;

        // 1. Get service duration to calculate end_time
        const { data: serviceData, error: serviceError } = await supabase
            .from('services')
            .select('duration_minutes')
            .eq('id', serviceId)
            .single();

        if (serviceError || !serviceData) {
            throw new AppError('Service not found or duration not set.', 404);
        }

        const endTime = new Date(new Date(startTime).getTime() + serviceData.duration_minutes * 60000).toISOString();

        // 2. Final availability check (prevent double booking)
        const { data: existingAppointments, error: existingError } = await supabase
            .from('appointments')
            .select('id')
            .eq('provider_id', providerId)
            .lt('start_time', endTime)
            .gt('end_time', startTime)
            .in('status', ['confirmed', 'pending_confirmation']);

        if(existingError){
            throw new AppError(`Error checking for existing appointments: ${existingError.message}`, 500);
        }

        if (existingAppointments && existingAppointments.length > 0) {
            throw new AppError('This time slot is no longer available. Please select another time.', 409);
        }

        // 3. Create the appointment
        const { data: newAppointment, error: createError } = await supabase
            .from('appointments')
            .insert({
                user_id: patientId,
                provider_id: providerId,
                service_id: serviceId,
                appointment_datetime: startTime, // Assuming start_time is the main field
                start_time: startTime,
                end_time: endTime,
                status: 'pending_confirmation', // Or 'confirmed' depending on business logic
            })
            .select()
            .single();
        
        if (createError) {
            throw new AppError(`Could not create appointment: ${createError.message}`, 500);
        }

        return newAppointment;
    }
}

interface ICreateAppointment {
    clinicId: string;
    serviceId: string;
    providerId: string;
    startTime: string; // e.g., "2025-09-01T10:30:00.000Z"
    notes?: string;
    userId: string;
}

export async function createAppointment(details: ICreateAppointment): Promise<any> {
    const { clinicId, serviceId, providerId, startTime, notes, userId } = details;

    const appointmentDate = startTime.split('T')[0];
    const appointmentTime = startTime.split('T')[1].substring(0, 8);

    // 1. Verify the requested slot is actually available
    const availableSlots = await getProviderAvailability(providerId, serviceId, appointmentDate);
    const isSlotAvailable = availableSlots.some(slot => slot.startTime === appointmentTime);

    if (!isSlotAvailable) {
        throw new AppError('The selected appointment slot is no longer available.', 409); // 409 Conflict
    }

    // 2. TODO: Check for overlapping appointments for the same user.

    // 3. Create the appointment
    const { data, error } = await supabase
        .from('appointments')
        .insert({
            clinic_id: clinicId,
            service_id: serviceId,
            provider_id: providerId,
            user_id: userId,
            start_time: startTime,
            // end_time will be calculated based on service duration later
            status: 'pending_confirmation', // Or 'confirmed' depending on business logic
            notes: notes,
        })
        .select()
        .single();

    if (error) {
        throw new AppError('Failed to create appointment.', 500, error);
    }

    return data;
} 