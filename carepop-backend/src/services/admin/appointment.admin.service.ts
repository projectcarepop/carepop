import { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../../utils/errors';
import { Database } from '../../types/supabase.types';
import { supabaseServiceRole } from '../../config/supabaseClient';
import { ListAppointmentsQuery } from '../../validation/admin/appointment.admin.validation';

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
    if (!reason) {
      throw new AppError('A cancellation reason is required.', 400);
    }
  
    const { data: updatedAppointment, error } = await this.supabase
      .from('appointments')
      .update({ 
        status: 'cancelled_by_clinic',
        cancellation_reason: reason,
      })
      .eq('id', appointmentId)
      .select()
      .single();
  
    if (error) {
      console.error('Error cancelling appointment:', error);
      throw new AppError('Failed to cancel appointment in the database.', 500);
    }
  
    return updatedAppointment;
  }

  async listAll(queryParams: ListAppointmentsQuery) {
    const { 
        page = 1, 
        limit = 10, 
        userId, 
        time_frame,
        sortBy = 'appointment_datetime',
        sortOrder = 'desc'
    } = queryParams;

    const offset = (page - 1) * limit;
    const now = new Date().toISOString();

    let query = this.supabase
        .from('appointments')
        .select(`
            *,
            service:services(name),
            provider:providers(first_name, last_name),
            clinic:clinics(name)
        `, { count: 'exact' });

    if (userId) {
        query = query.eq('user_id', userId);
    }

    if (time_frame === 'upcoming') {
        query = query.gte('appointment_datetime', now);
    } else if (time_frame === 'past') {
        query = query.lt('appointment_datetime', now);
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
                 .range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    
    if (error) {
        console.error('Error fetching appointments list:', error);
        throw new AppError('Failed to fetch appointments from the database.', 500);
    }
    
    return {
        data: data ?? [],
        meta: {
            totalItems: count ?? 0,
            itemsPerPage: limit,
            currentPage: page,
            totalPages: count ? Math.ceil(count / limit) : 0,
        },
    };
  }

  async getAllAppointments(options: { 
    clinicId?: string, 
    page?: number, 
    limit?: number, 
    search?: string 
  }): Promise<{ data: any[], total: number }> {
    const { clinicId, page = 1, limit = 10, search } = options;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('appointments')
      .select(`
        *,
        user:profiles!user_id(first_name, last_name, email),
        service:services(name),
        provider:providers(first_name, last_name)
      `, { count: 'exact' });

    if (clinicId) {
      query = query.eq('clinic_id', clinicId);
    }
    
    if (search) {
      console.warn('Search functionality across multiple fields is temporarily disabled.');
    }

    query = query.range(offset, offset + limit - 1)
                 .order('appointment_datetime', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching appointments:', { message: error.message, details: error.details, hint: error.hint });
      throw new AppError('Failed to fetch appointments from the database.', 500);
    }
    
    return { data: data || [], total: count || 0 };
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
