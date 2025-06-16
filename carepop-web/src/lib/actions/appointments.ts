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
export async function cancelAppointment(appointmentId: string) {
  const supabase = createClient();
   const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required." };
  }

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'Cancelled' })
    .eq('id', appointmentId)
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error cancelling appointment:', error);
    return { success: false, message: 'Failed to cancel appointment.' };
  }
  
  revalidatePath('/dashboard/appointments');
  return { success: true, message: 'Appointment cancelled successfully.' };
} 