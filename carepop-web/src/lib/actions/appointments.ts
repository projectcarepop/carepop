"use server";

import { revalidateTag } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { UserAppointmentDetails } from "@/lib/types/appointmentTypes";
import { getAuthToken } from '@/lib/utils/auth';
import { API_BASE_URL } from '@/lib/config';
import { Database } from '@/types/supabase'; // Import the main DB type

type AppointmentStatus = Database['public']['Enums']['appointment_status_enum'];

// This file contains a mix of user-facing and admin-facing server actions.

// =================================================================
// Admin-Facing Actions (These will BYPASS RLS)
// =================================================================

// Admin: Confirm an Appointment
export async function confirmAppointment(appointmentId: string) {
  const supabaseAdmin = getSupabaseAdmin();

  const { data: appointment, error: fetchError } = await supabaseAdmin
    .from('appointments')
    .select('clinic_id')
    .eq('id', appointmentId)
    .single();

  if (fetchError || !appointment) {
    console.error('Error fetching appointment clinic_id for confirm:', fetchError);
    return { success: false, message: 'Failed to find the appointment to confirm.' };
  }

  const { error } = await supabaseAdmin
    .from('appointments')
    .update({ status: 'confirmed' })
    .eq('id', appointmentId);

  if (error) {
    console.error('Error confirming appointment:', error);
    return { success: false, message: `Failed to confirm appointment: ${error.message}` };
  }

  revalidateTag(`admin-appointments-${appointment.clinic_id}`);
  return { success: true, message: 'Appointment confirmed successfully.' };
}

// Admin: Cancel an Appointment
export async function cancelAppointmentAsAdmin(appointmentId: string, reason: string) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: appointment, error: fetchError } = await supabaseAdmin
      .from('appointments')
      .select('clinic_id')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appointment) {
      console.error('Error fetching appointment clinic_id for cancel:', fetchError);
      return { success: false, message: 'Failed to find the appointment to cancel.' };
    }

    const { error } = await supabaseAdmin
      .from('appointments')
      .update({ 
        status: 'cancelled_by_clinic',
        notes_clinic: reason 
      })
      .eq('id', appointmentId);
    
    if (error) {
      console.error('Error cancelling appointment as admin:', error);
      return { success: false, message: `Failed to cancel appointment: ${error.message}` };
    }
    
    revalidateTag(`admin-appointments-${appointment.clinic_id}`);
    return { success: true, message: 'Appointment cancelled successfully.' };
}

// Admin: Delete an Appointment
export async function deleteAppointment(appointmentId: string) {
    const supabaseAdmin = getSupabaseAdmin();

    const { data: appointment, error: fetchError } = await supabaseAdmin
        .from('appointments')
        .select('clinic_id')
        .eq('id', appointmentId)
        .single();
        
    if (fetchError || !appointment) {
      console.error('Error fetching appointment clinic_id for delete:', fetchError);
      return { success: false, message: 'Failed to find the appointment to delete.' };
    }
    
    const { error } = await supabaseAdmin
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

    if (error) {
        console.error('Error deleting appointment:', error);
        return { success: false, message: `Failed to delete appointment: ${error.message}` };
    }

    revalidateTag(`admin-appointments-${appointment.clinic_id}`);
    return { success: true, message: 'Appointment deleted successfully.' };
}

export async function getFutureAppointmentsForAdmin(clinicId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
        .from('appointments')
        .select('*')
        .eq('clinic_id', clinicId)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching future admin appointments:', error);
        return [];
    }
    return data;
}

export async function getPastAppointmentsForAdmin(clinicId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
        .from('appointments')
        .select('*')
        .eq('clinic_id', clinicId)
        .lt('start_time', new Date().toISOString())
        .order('start_time', { ascending: false });

    if (error) {
        console.error('Error fetching past admin appointments:', error);
        return [];
    }
    return data;
}

export async function getAppointmentDetailsForAdmin(appointmentId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();
    
    if (error) {
        console.error('Error fetching appointment details:', error);
        return null;
    }
    return data;
}

export async function updateAppointmentStatusAsAdmin(appointmentId: string, status: string, clinicId: string) {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
        .from('appointments')
        .update({ status: status as AppointmentStatus })
        .eq('id', appointmentId);

    if (error) {
        return { success: false, message: error.message };
    }
    revalidateTag(`admin-appointments-${clinicId}`);
    return { success: true };
}

export async function createAppointmentAsAdmin(formData: FormData) {
    const supabaseAdmin = getSupabaseAdmin();
    const startTime = formData.get('startTime') as string;
    const DURATION_MINUTES = 30; 

    const payload = {
        clinic_id: formData.get('clinicId') as string,
        service_id: formData.get('serviceId') as string,
        provider_id: formData.get('providerId') as string,
        user_id: formData.get('patientId') as string,
        start_time: startTime,
        status: formData.get('status') as AppointmentStatus,
        appointment_datetime: startTime, 
        duration_minutes: DURATION_MINUTES,
    };
    const { data, error } = await supabaseAdmin.from('appointments').insert(payload);
    
    if (error) return { success: false, message: error.message };

    revalidateTag(`admin-appointments-${payload.clinic_id}`);
    return { success: true, data };
}

export async function deleteAppointmentAsAdmin(appointment: { id: string, clinic_id: string }) {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
        .from('appointments')
        .delete()
        .eq('id', appointment.id);

    if (error) return { success: false, message: error.message };

    revalidateTag(`admin-appointments-${appointment.clinic_id}`);
    return { success: true };
}

// =================================================================
// User-Facing Actions (These will use user's token)
// =================================================================

export async function createAppointmentAction(
    clinicId: string, 
    serviceId: string, 
    providerId: string, 
    startTime: string, 
    notes?: string
): Promise<{success: boolean; message: string; data?: any}> {
    const token = await getAuthToken();
    if (!token) {
        return { success: false, message: "Authentication required." };
    }

    const payload = { clinicId, serviceId, providerId, startTime, notes };

    try {
        const response = await fetch(`${API_BASE_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, message: result.message || 'Failed to create appointment.' };
        }

        return { success: true, message: "Appointment created successfully!", data: result.data };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
        console.error('createAppointmentAction error:', message);
        return { success: false, message };
    }
}

export async function getProviderAvailability(providerId: string, serviceId: string, date: string): Promise<{success: boolean; message?: string; data?: any}> {
    const token = await getAuthToken();
    if (!token) {
        return { success: false, message: "Authentication required." };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/availability/providers/${providerId}/availability?serviceId=${serviceId}&date=${date}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, message: result.message || 'Failed to fetch availability.' };
        }

        return { success: true, data: result.data };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
        console.error('getProviderAvailability error:', message);
        return { success: false, message };
    }
}