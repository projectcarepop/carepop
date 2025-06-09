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

    // Step 1: Fetch paginated appointments
    let appointmentsQuery = this.supabase
      .from('appointments')
      .select(`*`, { count: 'exact' });

    if (clinicId) {
      appointmentsQuery = appointmentsQuery.eq('clinic_id', clinicId);
    }
    
    // TODO: Implement a more robust search. The previous implementation was unreliable.
    // This would likely require a dedicated database function or view.
    if (search) {
      console.warn('Search is not fully implemented for appointments yet.');
    }

    appointmentsQuery = appointmentsQuery.range(offset, offset + limit - 1)
                 .order('appointment_datetime', { ascending: false });

    const { data: appointments, error: appointmentsError, count } = await appointmentsQuery;

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      throw new AppError('Failed to fetch appointments from the database.', 500);
    }
    if (!appointments || appointments.length === 0) {
      return { data: [], total: 0 };
    }

    // Step 2: Collect unique, non-null IDs from the appointments
    const userIds = [...new Set(appointments.map(a => a.user_id).filter((id): id is string => !!id))];
    const serviceIds = [...new Set(appointments.map(a => a.service_id).filter((id): id is string => !!id))];
    const providerIds = [...new Set(appointments.map(a => a.provider_id).filter((id): id is string => !!id))];

    // Step 3: Fetch all related data in parallel
    const [profilesRes, servicesRes, providersRes] = await Promise.all([
      userIds.length ? this.supabase.from('profiles').select('user_id, first_name, last_name, email').in('user_id', userIds) : Promise.resolve({ data: [], error: null }),
      serviceIds.length ? this.supabase.from('services').select('id, name').in('id', serviceIds) : Promise.resolve({ data: [], error: null }),
      providerIds.length ? this.supabase.from('providers').select('id, first_name, last_name').in('id', providerIds) : Promise.resolve({ data: [], error: null })
    ]);

    if (profilesRes.error || servicesRes.error || providersRes.error) {
      console.error({ profilesError: profilesRes.error, servicesError: servicesRes.error, providersError: providersRes.error });
      throw new AppError('Failed to fetch related appointment data.', 500);
    }

    // Step 4: Create maps for efficient lookup
    const profilesMap = new Map(profilesRes.data?.map(p => [p.user_id, p]));
    const servicesMap = new Map(servicesRes.data?.map(s => [s.id, s]));
    const providersMap = new Map(providersRes.data?.map(p => [p.id, p]));

    // Step 5: Manually embed the related data into each appointment
    const enrichedData = appointments.map(appt => ({
      ...appt,
      users: appt.user_id ? profilesMap.get(appt.user_id) || null : null,
      services: appt.service_id ? servicesMap.get(appt.service_id) || null : null,
      providers: appt.provider_id ? providersMap.get(appt.provider_id) || null : null,
    }));
    
    return { data: enrichedData, total: count || 0 };
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
