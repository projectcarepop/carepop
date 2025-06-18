"use server";

import { revalidateTag } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { UserAppointmentDetails } from "@/lib/types/appointmentTypes";

// This file contains a mix of user-facing and admin-facing server actions.

// =================================================================
// Admin-Facing Actions (These will BYPASS RLS)
// =================================================================

// Admin: Confirm an Appointment
export async function confirmAppointment(appointmentId: string) {
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