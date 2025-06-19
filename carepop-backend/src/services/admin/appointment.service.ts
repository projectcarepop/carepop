// This file has been simplified to resolve a critical build error.
import { supabaseServiceRole } from '../../config/supabaseClient';
import { AppError } from '../../utils/errors';

/**
 * This is a simplified service object for the demo.
 * It contains essential functions for managing appointments.
 */
export const appointmentService = {
  
  /**
   * Fetches all appointments with basic details.
   */
  getAll: async () => {
    const { data, error } = await supabaseServiceRole
      .from('appointments')
      .select(`
        id,
        appointment_date,
        start_time,
        status,
        profiles ( first_name, last_name ),
        clinics ( name ),
        services ( name )
      `);

    if (error) { 
      console.error('Error in getAll appointments:', error);
      throw new AppError('Failed to fetch appointments.', 500); 
    }
    return data;
  },

  /**
   * Fetches a single appointment by its ID.
   * @param id The ID of the appointment to fetch.
   */
  getById: async (id: string) => {
    const { data, error } = await supabaseServiceRole
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      if (error.code === 'PGRST116') {
        throw new AppError('Appointment not found.', 404);
      }
      throw new AppError('Failed to fetch appointment.', 500);
    }

    if (!data) {
        throw new AppError(`No data returned for appointment ID ${id}.`, 404);
    }

    return data;
  },
};
