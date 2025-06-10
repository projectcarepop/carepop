"use server"; // Directive to mark all exports as Server Actions

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AppError } from '@/lib/utils/errors';

// Helper to get the auth token
async function getAuthToken() {
  const supabase = await createSupabaseServerClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    throw new AppError('Authentication required.', 401);
  }
  return session.access_token;
}

// Fetch Future Appointments
export async function getFutureAppointments() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`/api/v1/admin/appointments?time_frame=upcoming`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new AppError('Failed to fetch upcoming appointments');
    return { success: true, data: await response.json() };
  } catch (error) {
    console.error(error);
    return { success: false, message: error instanceof AppError ? error.message : 'An unknown error occurred.' };
  }
}

// Fetch Past Appointments
export async function getPastAppointments() {
  try {
    const token = await getAuthToken();
    const response = await fetch(`/api/v1/admin/appointments?time_frame=past`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new AppError('Failed to fetch past appointments');
    return { success: true, data: await response.json() };
  } catch (error) {
    console.error(error);
    return { success: false, message: error instanceof AppError ? error.message : 'An unknown error occurred.' };
  }
}

// Cancel an Appointment
export async function cancelAppointment(appointmentId: string) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`/api/v1/admin/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'Cancelled' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AppError(errorData.message || 'Failed to cancel appointment', response.status);
    }
    
    revalidatePath('/dashboard/appointments');
    return { success: true, message: 'Appointment cancelled successfully.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: error instanceof AppError ? error.message : 'An unknown error occurred.' };
  }
}

// Create a new Appointment (Booking)
export async function createAppointment(payload: Record<string, unknown>) {
  try {
    const token = await getAuthToken();
    const response = await fetch(`/api/v1/admin/appointments`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new AppError(errorData.message || 'Failed to create appointment', response.status);
    }

    revalidatePath('/dashboard/appointments');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: error instanceof AppError ? error.message : 'An unknown error occurred.' };
  }
} 