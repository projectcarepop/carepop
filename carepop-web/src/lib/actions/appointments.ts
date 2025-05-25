"use server"; // Directive to mark all exports as Server Actions

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Import createServerClient
import { 
  AppointmentStatus, 
  ServiceDetails, 
  ClinicDetails, 
  ProviderDetails, 
  UserAppointmentDetails 
} from '@/lib/types/appointmentTypes'; // Import types

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

// Type definitions are now in ../types/appointmentTypes.ts

async function getAuthToken(): Promise<string | null> {
  // No longer capturing cookieStore here

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          // Call cookies() directly inside the method
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            // Call cookies() directly inside the method
            const cookieStore = await cookies();
            cookieStore.set(name, value, options);
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            // Call cookies() directly inside the method
            const cookieStore = await cookies();
            cookieStore.set(name, '', options); // Note: Supabase examples use set with empty string for remove
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[getAuthToken] Supabase getSession error:', error);
      return null;
    }
    return session?.access_token || null;
  } catch (error) {
    console.error('[getAuthToken] Unexpected error during getSession:', error);
    return null;
  }
}

export async function getFutureAppointments(): Promise<UserAppointmentDetails[]> {
  const token = await getAuthToken();
  if (!token) {
    console.error('[getFutureAppointments] No auth token found.');
    throw new Error('Authentication required to fetch future appointments.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/appointments/me/future`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store', // Ensure fresh data for dynamic content like appointments
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`[getFutureAppointments] API error ${response.status}:`, errorData);
      throw new Error(`Failed to fetch future appointments: ${errorData.message || response.statusText}`);
    }
    return await response.json() as UserAppointmentDetails[];
  } catch (error) {
    console.error('[getFutureAppointments] Fetching error:', error);
    if (error instanceof Error) {
        throw error; // Re-throw original error if it's already an Error instance
    } else {
        throw new Error('An unexpected error occurred while fetching future appointments.');
    }
  }
}

export async function getPastAppointments(): Promise<UserAppointmentDetails[]> {
  const token = await getAuthToken();
  if (!token) {
    console.error('[getPastAppointments] No auth token found.');
    throw new Error('Authentication required to fetch past appointments.');
    // return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/appointments/me/past`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`[getPastAppointments] API error ${response.status}:`, errorData);
      throw new Error(`Failed to fetch past appointments: ${errorData.message || response.statusText}`);
    }
    return await response.json() as UserAppointmentDetails[];
  } catch (error) {
    console.error('[getPastAppointments] Fetching error:', error);
     if (error instanceof Error) {
        throw error;
    } else {
        throw new Error('An unexpected error occurred while fetching past appointments.');
    }
  }
}

export async function cancelAppointmentAction(
  appointmentId: string, 
  cancellationReason: string
): Promise<{ success: boolean; message?: string; data?: UserAppointmentDetails }> {
  const token = await getAuthToken();
  if (!token) {
    console.error('[cancelAppointmentAction] No auth token found.');
    return { success: false, message: 'Authentication required.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cancelledBy: 'user', // Assuming cancellation is by the user from this UI
        cancellationReason: cancellationReason
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`[cancelAppointmentAction] API error ${response.status}:`, errorData);
      return { success: false, message: errorData.message || `Failed to cancel appointment: ${response.statusText}` };
    }
    
    const responseData = await response.json();
    return { success: true, data: responseData as UserAppointmentDetails };

  } catch (error) {
    console.error('[cancelAppointmentAction] Fetching error:', error);
    return { success: false, message: error instanceof Error ? error.message : 'An unexpected error occurred.' };
  }
} 