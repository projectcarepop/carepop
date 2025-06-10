import { supabaseServiceRole } from '../../config/supabaseClient';
import { updateAppointmentSchema } from '../../validation/admin/appointment.admin.validation';
import { z } from 'zod';
import { AppError } from '../../utils/errors';

const TABLE_NAME = 'appointments';

type UpdateAppointmentDTO = z.infer<typeof updateAppointmentSchema>;

const selectWithJoins = `
    *,
    user:profiles!user_id (id, first_name, last_name, email),
    provider:providers (id, first_name, last_name),
    clinic:clinics (id, name),
    service:services (id, name, description)
`;

export const appointmentService = {
  getAll: async () => {
    const { data, error } = await supabaseServiceRole.from(TABLE_NAME).select(selectWithJoins);
    if (error) { throw new AppError('Failed to fetch appointments.', 500); }
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabaseServiceRole.from(TABLE_NAME).select(selectWithJoins).eq('id', id).single();
    if (error) {
        if (error.code === 'PGRST116') { throw new AppError('Appointment not found.', 404); }
        throw new AppError('Failed to fetch appointment.', 500);
    }
    return data;
  },

  update: async (id: string, appointmentData: UpdateAppointmentDTO) => {
    const { data, error } = await supabaseServiceRole.from(TABLE_NAME).update(appointmentData).eq('id', id).select(selectWithJoins).single();
    if (error) {
        if (error.code === 'PGRST116') { throw new AppError('Appointment not found.', 404); }
        throw new AppError('Failed to update appointment.', 500);
    }
    return data;
  },
}; 