"use server"; // Directive to mark all exports as Server Actions

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { UserAppointmentDetails } from "@/lib/types/appointmentTypes";

// Fetch Future Appointments
export async function getFutureAppointments() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required.", data: [] };
  }

  const { data, error } = await supabase
    .from('user_appointments_details')
    .select('*')
    .eq('user_id', user.id)
    .gt('schedule', new Date().toISOString())
    .order('schedule', { ascending: true });

  if (error) {
    console.error("Error fetching upcoming appointments:", error);
    return { success: false, message: "Failed to load upcoming appointments.", data: [] };
  }
  
  return { success: true, data: data as UserAppointmentDetails[] };
}

// Fetch Past Appointments
export async function getPastAppointments() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required.", data: [] };
  }

  const { data, error } = await supabase
    .from('user_appointments_details')
    .select('*')
    .eq('user_id', user.id)
    .lte('schedule', new Date().toISOString())
    .order('schedule', { ascending: false });

  if (error) {
    console.error("Error fetching past appointments:", error);
    return { success: false, message: "Failed to load past appointments.", data: [] };
  }
  
  return { success: true, data: data as UserAppointmentDetails[] };
}

// Cancel an Appointment
export async function cancelAppointment(appointmentId: string, reason?: string) {
  const supabase = createClient();
   const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required." };
  }

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'Cancelled', cancellation_reason: reason })
    .eq('id', appointmentId)
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error cancelling appointment:', error);
    return { success: false, message: 'Failed to cancel appointment.' };
  }
  
  revalidatePath('/dashboard/appointments');
  return { success: true, message: 'Appointment cancelled successfully.' };
}

// Admin: Confirm an Appointment
export async function confirmAppointment(appointmentId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'Confirmed' })
    .eq('id', appointmentId);

  if (error) {
    console.error('Error confirming appointment:', error);
    return { success: false, message: 'Failed to confirm appointment.' };
  }

  revalidatePath('/admin/appointments');
  return { success: true, message: 'Appointment confirmed successfully.' };
}

// Admin: Delete an Appointment
export async function deleteAppointment(appointmentId: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

    if (error) {
        console.error('Error deleting appointment:', error);
        return { success: false, message: 'Failed to delete appointment.' };
    }

    revalidatePath('/admin/appointments');
    return { success: true, message: 'Appointment deleted successfully.' };
}

// Admin: Reschedule an Appointment (Placeholder)
export async function rescheduleAppointment(appointmentId: string, newDateTime: string) {
    // const supabase = createClient(); // Keep this commented out until implemented
    // TODO: Implement reschedule logic
    console.log(`Rescheduling ${appointmentId} to ${newDateTime}`);
    revalidatePath('/admin/appointments');
    return { success: true, message: 'Appointment reschedule functionality not yet implemented.' };
} 