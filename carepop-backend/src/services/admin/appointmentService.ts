import { supabaseServiceRole } from '../../config/supabaseClient';
import { Appointment } from '../../types/appointmentTypes';

export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> => {
    const { data, error } = await supabaseServiceRole
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

export const getAppointmentById = async (id: string): Promise<Appointment | null> => {
    const { data, error } = await supabaseServiceRole
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};