import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";
import type {
  Clinic,
  DetailedAppointment,
  DetailedMedicalRecord,
  MedicalRecord,
  MedicalRecordWithRelations,
  Profile,
  UpdateProfileApiPayload,
  AvailabilitySlot,
  ServiceWithCategory,
  HealthLog,
  CreateHealthLogPayload,
  AIInsight,
  MenstrualLog,
  CreateMenstrualLogPayload,
  HealthLogSummary,
} from "../lib/types";
import type { RegisterFormValues, LoginFormValues } from '../lib/validation/auth';
import { keysToCamel } from "../lib/utils/data-transformation";
import { parseISOString } from "../lib/utils/date";

export type ServiceCategory = {
  id: string;
  name: string;
};

// Ensure the API URL is read from environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not set in environment variables.");
}

/**
 * A reusable fetch wrapper for making API calls to our backend.
 * It automatically handles content type, base URL, and basic error handling.
 * @param path The API endpoint path (e.g., '/api/me/profile')
 * @param options Standard fetch options, including the Authorization header.
 * @returns The JSON response from the API.
 */
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (session) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        const errorBody = await response.json();
        let message = `API request failed with status ${response.status}`;

        if (errorBody.error) {
          if (typeof errorBody.error === 'string') {
            message = errorBody.error;
          } else if (typeof errorBody.error === 'object' && errorBody.error.issues) {
            message = errorBody.error.issues.map((issue: any) => `${issue.path.join('.')} - ${issue.message}`).join('\\n');
          } else {
            message = JSON.stringify(errorBody.error);
          }
        }
        
        const error = new Error(message);
        throw error;
      } else {
        // Handle non-JSON error responses
        const textError = await response.text();
        throw new Error(`API Error: ${response.status} - ${textError}`);
      }
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      throw new Error(`API request failed with status ${response.status}`);
    }
  }

  if (response.status === 204) {
    return null as any;
  }

  return response.json();
}

/**
 * A reusable wrapper for making direct Supabase calls.
 * It standardizes error handling for all direct DB interactions.
 * @param query A Supabase query promise.
 * @returns The data from the query.
 * @throws An error if the Supabase query returns an error.
 */
async function supabaseCall<T>(query: PromiseLike<{ data: T; error: import('@supabase/supabase-js').PostgrestError | null }>): Promise<T> {
  const { data, error } = await query;
  if (error) {
    // Here you could add centralized logging in the future
    throw new Error(error.message);
  }
  return data;
}

/**
 * A reusable wrapper for handling Supabase Auth responses.
 * It standardizes error handling for all auth interactions.
 * @param response The response promise from a Supabase auth call.
 * @returns The data from the auth response.
 * @throws An error if the Supabase auth call returns an error.
 */
async function supabaseAuthCall<T>(responsePromise: Promise<{ data: T; error: import('@supabase/supabase-js').AuthError | null }>): Promise<T> {
  const { data, error } = await responsePromise;
  if (error) {
    throw error;
  }
  return data;
}

// ============================================================================
// AUTHENTICATED ROUTES
// ============================================================================

/**
 * Retrieves the appointments for the currently authenticated user.
 * @returns A promise that resolves to an array of detailed appointments.
 */
export const getMyAppointments = async (): Promise<DetailedAppointment[]> => {
  const result = await apiFetch<{ appointments: DetailedAppointment[] }>("/api/me/appointments", {
    method: "GET",
  });
  
  const appointments = result?.appointments || [];

  // Sort appointments by date in ascending order (soonest first)
  // MUST use the custom parser to handle non-standard date strings from the DB
  return appointments.sort((a, b) => {
    const dateA = parseISOString(a.appointmentTime);
    const dateB = parseISOString(b.appointmentTime);
    // Handle cases where parsing might fail
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateA.getTime() - dateB.getTime();
  });
};

/**
 * A helper function to get authorization headers.
 * @param supabase The Supabase client instance.
 * @returns A promise that resolves to the headers object.
 */
async function getAuthHeaders(supabase: SupabaseClient) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
      throw new Error("User not authenticated");
  }
  return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
  };
}

/**
 * Updates the profile for the currently authenticated user.
 * @param supabase The Supabase client instance.
 * @param profileData The partial profile data to update.
 * @returns A promise that resolves to the updated user profile.
 */
export async function updateMyProfile(
  supabase: SupabaseClient,
  profileData: UpdateProfileApiPayload,
): Promise<Profile> {
  console.log("Service Layer: updateMyProfile called with data:", profileData); // For debugging

  const headers = await getAuthHeaders(supabase);
  const response = await fetch(`${API_URL}/api/me/profile`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(profileData), // The payload is already in the correct format
  });

  if (!response.ok) {
    // Try to parse a JSON error from the backend, otherwise throw a generic error
    try {
        const errorBody = await response.json();
        const message = errorBody.error || errorBody.message || `API Error: ${response.status}`;
        throw new Error(message);
    } catch (e) {
        if (e instanceof Error) {
            throw e; // Rethrow the more specific error
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
  }

  const data = await response.json();
  return keysToCamel(data); // Ensure consistency with frontend
}

/**
 * Retrieves the medical records for the currently authenticated user by calling the backend endpoint.
 * @returns A promise that resolves to an array of medical records.
 */
export const getMyMedicalRecords = async (): Promise<MedicalRecord[]> => {
  const response = await apiFetch<{ records: MedicalRecord[] }>('/api/me/records');
  return response?.records ?? [];
};

/**
 * Retrieves the details of a specific medical record for the currently authenticated user.
 * @param recordId The ID of the medical record to fetch.
 * @returns A promise that resolves to the medical record with relations.
 */
export const getMedicalRecordDetails = async (recordId: string): Promise<MedicalRecordWithRelations> => {
  return apiFetch<MedicalRecordWithRelations>(`/api/me/records/${recordId}`);
};

/**
 * Generates a download link for a medical document.
 * @param recordId The ID of the medical record containing the document.
 * @returns A promise that resolves to download information.
 */
export const downloadMedicalDocument = async (recordId: string): Promise<{ downloadUrl: string; fileName: string }> => {
  return apiFetch<{ downloadUrl: string; fileName: string }>(`/api/me/records/${recordId}/download`);
};

// ============================================================================
// HEALTH BUDDY API
// ============================================================================

/**
 * Creates a new health log for the authenticated user.
 */
export const createHealthLog = async (payload: CreateHealthLogPayload): Promise<HealthLog> => {
  return apiFetch<HealthLog>('/api/me/health-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Creates a new menstrual cycle log for the authenticated user.
 */
export async function createMenstrualLog(logData: { startDate: string; endDate?: string }): Promise<MenstrualLog> {
  const payload = {
    start_date: logData.startDate,
    end_date: logData.endDate || logData.startDate, // Ensure end_date is always sent
  };
  return apiFetch<MenstrualLog>('/api/me/menstrual-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Fetches all health logs for the authenticated user.
 */
export const getHealthLogs = async (): Promise<HealthLog[]> => {
  const result = await apiFetch<{ health_logs: HealthLog[] }>('/api/me/health-logs', {
    method: 'GET',
  });
  return result?.health_logs || [];
};

/**
 * Fetches a summary of health logs, like most frequent symptoms for the last 7 days.
 * This is now a client-side function that processes the raw logs.
 */
export const getHealthLogSummary = async (): Promise<HealthLogSummary> => {
    const logs = await getHealthLogs();
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLogs = logs.filter(log => new Date(log.logDate) >= sevenDaysAgo);

    const symptomCounts = recentLogs
        .flatMap(log => log.symptoms || [])
        .reduce((acc, symptom) => {
            acc[symptom] = (acc[symptom] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

    const frequentSymptoms = Object.entries(symptomCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([symptom, count]) => ({ symptom, count }));

    return { frequentSymptoms };
};

/**
 * Generates a health insight based on recent logs by calling the backend AI service.
 */
export const getAiInsight = async (): Promise<AIInsight> => {
  return apiFetch<AIInsight>('/api/me/ai/insight', {
    method: 'GET',
  });
};

/**
 * This payload is used for creating a new appointment via the mobile app.
 * Updated to include doctor selection like the web implementation.
 */
export type NewAppointmentPayload = {
  clinicId: string;
  serviceId: string;
  doctorId: string;
  appointmentTime: string; // ISO String for the selected slot
};

/**
 * Creates a new appointment for the currently authenticated user.
 * @param appointmentData The data for the new appointment.
 * @returns A promise that resolves to the newly created detailed appointment.
 */
export const createAppointment = async (
  appointmentData: NewAppointmentPayload,
): Promise<DetailedAppointment> => {
  // Convert frontend payload to backend format
  const backendPayload = {
    clinic_id: appointmentData.clinicId,
    service_id: appointmentData.serviceId,
    doctor_id: appointmentData.doctorId,
    appointment_time: appointmentData.appointmentTime,
  };
  
  return apiFetch<DetailedAppointment>("/api/me/appointments", {
    method: "POST",
    body: JSON.stringify(backendPayload),
  });
};

// ============================================================================
// PUBLIC ROUTES (do not require authentication)
// ============================================================================

/**
 * Fetches all publicly available clinics.
 * @returns A promise that resolves to an array of clinics.
 */
export const getPublicClinics = async (): Promise<Clinic[]> => {
  const url = `${API_URL}/api/public/clinics`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch public clinics: ${response.status} - ${errorText}`);
    }
    const result = await response.json();
    // The public clinics endpoint returns a { data: [...] } envelope
    return result.data || [];
  } catch (error) {
    console.error("Error in getPublicClinics:", error);
    throw error;
  }
};

const MAPBOX_API_KEY = process.env.EXPO_PUBLIC_MAPBOX_API_KEY;

export const getMapboxRoute = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
) => {
  if (!MAPBOX_API_KEY) {
    throw new Error('Mapbox API key is not configured.');
  }

  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&steps=true&overview=full&access_token=${MAPBOX_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Mapbox Directions API Error:', errorData);
      throw new Error(errorData.message || 'Failed to fetch directions from Mapbox.');
    }
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      return data.routes[0]; // Return the first route object
    }
    throw new Error('No routes found.');
  } catch (error) {
    console.error('Error fetching Mapbox route:', error);
    throw error;
  }
};

/**
 * Fetches the details for a single public clinic by its ID.
 * @param clinicId The ID of the clinic to fetch.
 * @returns A promise that resolves to the detailed clinic object.
 */
export const getPublicClinicDetails = async (clinicId: string): Promise<Clinic> => {
    return apiFetch<Clinic>(`/api/public/clinics/${clinicId}`);
}

/**
 * (NEW) Searches for clinics based on multiple filter criteria for the Clinic Finder.
 * This function calls the dedicated, powerful search endpoint.
 */
type ClinicSearchFilters = {
  q?: string;
  lat?: number;
  lon?: number;
  radius?: number; // in meters
};

export async function searchClinicsForFinder(filters: ClinicSearchFilters): Promise<Clinic[]> {
  const params = new URLSearchParams();
  
  if (filters.q) params.append('q', filters.q);
  if (filters.lat) params.append('lat', String(filters.lat));
  if (filters.lon) params.append('lon', String(filters.lon));
  if (filters.radius) params.append('radius', String(filters.radius));

  const queryString = params.toString();
  // Ensure we are hitting the correct, powerful search endpoint
  const url = `${API_URL}/api/public/clinics/nearby?${queryString}`;
  
  console.log(`[Service Layer] Calling Clinic Finder API: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to search clinics: ${response.status} - ${errorText}`);
    }
    const result = await response.json();
    
    // The /nearby endpoint returns a `location` string, e.g., "POINT(121.123 14.456)"
    // We must parse this into latitude and longitude for the map components.
    if (Array.isArray(result)) {
        return result.map((clinic: any) => {
            if (clinic.location && typeof clinic.location === 'string') {
                const match = clinic.location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
                if (match) {
                    return {
                        ...clinic,
                        longitude: parseFloat(match[1]),
                        latitude: parseFloat(match[2]),
                    };
                }
            }
            return clinic;
        });
    }

    return [];
    
  } catch (error) {
    console.error("Error in searchClinicsForFinder:", error);
    throw error; // Re-throw the error for TanStack Query to handle
  }
}

/**
 * Fetches publicly available services. If a clinic ID is provided, it fetches
 * services available at that specific clinic.
 * @param clinicId Optional clinic ID.
 * @returns A promise that resolves to an array of services with their categories.
 */
export const getPublicServices = async (clinicId?: string): Promise<ServiceWithCategory[]> => {
  const endpoint = clinicId ? `/api/public/services?clinicId=${clinicId}` : '/api/public/services';
  const response = await apiFetch<{ data: ServiceWithCategory[] }>(endpoint);
  return response?.data ?? [];
};

/**
 * Fetches the raw list of booked appointments for a specific clinic within a given date range.
 * This is the new, simplified data source for frontend availability logic.
 * @param clinicId The UUID of the clinic.
 * @param startDate The start of the date range (ISO string).
 * @param endDate The end of the date range (ISO string).
 * @returns A promise that resolves to an array of appointment objects.
 */
export const getClinicBookedAppointments = async ({
    clinicId,
    startDate,
    endDate,
}: {
    clinicId: string;
    startDate: string;
    endDate: string;
}): Promise<{ data: { appointmentTime: string; serviceId: string }[] }> => {
    const query = new URLSearchParams({ startDate, endDate });
    return apiFetch<{ data: { appointmentTime: string; serviceId: string }[] }>(
        `/api/public/clinics/${clinicId}/appointments?${query.toString()}`,
        { method: 'GET' }
    );
};

/**
 * Fetches all publicly available service categories.
 * @returns A promise that resolves to an array of service categories.
 */
export const getPublicServiceCategories = async (): Promise<ServiceCategory[]> => {
  return apiFetch<ServiceCategory[]>("/api/public/service-categories");
};

/**
 * Fetches providers/doctors available for a specific service.
 * @param serviceId The ID of the service.
 * @param clinicId Optional clinic ID to filter providers.
 * @returns A promise that resolves to providers for the service.
 */
export const getProvidersForService = async (serviceId: string, clinicId?: string) => {
  const url = new URL(`${API_URL}/api/public/services/${serviceId}/providers`);
  if (clinicId) {
    url.searchParams.set('clinicId', clinicId);
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch providers for service: ${response.status} - ${errorText}`);
  }
  return response.json();
};

/**
 * Gets available time slots for a specific doctor on a specific date.
 * This uses the sophisticated backend calculation that considers doctor schedules,
 * doctor overrides, clinic holidays, and existing appointments.
 * @param doctorId The UUID of the doctor.
 * @param serviceId The UUID of the service.
 * @param clinicId The UUID of the clinic.
 * @param date The date in YYYY-MM-DD format.
 * @returns A promise that resolves to an array of available time slots (ISO strings).
 */
export const getAvailableSlots = async (
  doctorId: string,
  serviceId: string,
  clinicId: string,
  date: string
) => {
  const response = await fetch(`${API_URL}/api/public/doctors/${doctorId}/available-slots?serviceId=${serviceId}&clinicId=${clinicId}&date=${date}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch available slots: ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  return data.data; // The backend wraps the array in a 'data' property
};

/**
 * Gets all days with available slots for a given doctor/service in a specific month.
 * @param doctorId The UUID of the doctor.
 * @param serviceId The UUID of the service.
 * @param clinicId The UUID of the clinic.
 * @param month The month to check (1-12).
 * @param year The year to check.
 * @returns A promise that resolves to a list of dates (YYYY-MM-DD) that have availability.
 */
export const getAvailableDays = async (
  doctorId: string,
  serviceId: string,
  clinicId: string,
  month: number,
  year: number
) => {
  const response = await fetch(`${API_URL}/api/public/doctors/${doctorId}/available-days?serviceId=${serviceId}&clinicId=${clinicId}&month=${month}&year=${year}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch available days: ${response.status} - ${errorText}`);
  }
  const data = await response.json();
  return data.data;
};

/**
 * Validates if a specific slot is still available before booking.
 * @param doctorId The ID of the doctor.
 * @param serviceId The ID of the service.
 * @param clinicId The ID of the clinic.
 * @param appointmentTime The appointment time in ISO string format.
 * @returns A promise that resolves to availability status.
 */
export const validateSlotAvailability = async (
  doctorId: string,
  serviceId: string,
  clinicId: string,
  appointmentTime: string
): Promise<{ available: boolean; message?: string }> => {
  try {
    const response = await apiFetch<{ available: boolean; message?: string }>("/api/me/appointments/validate-slot", {
      method: "POST",
      body: JSON.stringify({
        doctor_id: doctorId,
        service_id: serviceId,
        clinic_id: clinicId,
        appointment_time: appointmentTime,
      }),
    });
    return response;
  } catch (error) {
    // Fallback: If validation endpoint doesn't exist, assume available but warn
    console.warn("Slot validation endpoint not available, proceeding with booking attempt");
    return { 
      available: true, 
      message: "Unable to verify slot availability. Booking will be attempted." 
    };
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  // This auth method doesn't return data, so we handle it slightly differently.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'io.supabase.carepop://login?screen=reset-password', // Your app's deep link
  });

  if (error) {
    throw new Error(error.message);
  }
  // No return value needed, success is implied.
};

export const getMyProfile = async (): Promise<Profile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(error.message);
  }

  return profile ? keysToCamel(profile) : null;
};

export const getAppointmentById = async (id: string): Promise<DetailedAppointment | null> => {
  return supabaseCall(
    supabase
      .from('detailed_appointments') // Using the view we created
      .select('*')
      .eq('id', id)
      .single()
  );
};

export const cancelAppointment = async (id: string): Promise<void> => {
  await supabaseCall(
    supabase
      .from('appointments')
      .update({ status: 'canceled_by_patient' })
      .eq('id', id)
  );
};

export const signUpWithEmail = async (payload: RegisterFormValues) => {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      emailRedirectTo: 'io.supabase.carepop://auth/callback',
    },
  });

  if (error) {
    throw error;
  }
  return data;
};

export const signInWithEmail = async (payload: LoginFormValues) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error) {
    throw error;
  }
  return data;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });

  if (error) {
    throw error;
  }
  return data;
}; 