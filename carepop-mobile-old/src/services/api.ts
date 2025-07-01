import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient"; // FIX 1: Correct the import path
import type {
  Clinic,
  DetailedAppointment,
  MedicalRecord,
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
  return result?.appointments || [];
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
export const createMenstrualLog = async (payload: CreateMenstrualLogPayload): Promise<MenstrualLog> => {
  // Assuming a backend endpoint like '/api/me/menstrual-logs'
  // This will need to be created in the backend.
  return apiFetch<MenstrualLog>('/api/me/menstrual-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

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
 */
export const getHealthLogSummary = async (): Promise<HealthLogSummary> => {
  // Assuming a backend endpoint like '/api/me/health-logs/summary'
  // This will need to be created in the backend.
  const summary = await apiFetch<HealthLogSummary>('/api/me/health-logs/summary');
  return summary ?? { frequentSymptoms: [] };
};

/**
 * Fetches an AI insight based on the user's health logs.
 * @returns A promise that resolves to an object containing the AI insight.
 */
export const getAiInsight = async (): Promise<AIInsight> => {
  return apiFetch<AIInsight>("/api/me/ai/insight", {
    method: "POST", // This is a POST as it triggers a generation process
  });
};

/**
 * This payload is used for creating a new appointment via the mobile app,
 * reflecting the new backend logic where a doctor is not selected upfront.
 */
export type NewAppointmentPayload = {
  clinicId: string;
  serviceId: string;
  appointmentTime: string; // ISO String for the selected slot
};

/**
 * Creates a new appointment for the currently authenticated user.
 * This is updated to use the simplified payload.
 * @param appointmentData The data for the new appointment.
 * @returns A promise that resolves to the newly created detailed appointment.
 */
export const createAppointment = async (
  appointmentData: NewAppointmentPayload,
): Promise<DetailedAppointment> => {
  return apiFetch<DetailedAppointment>("/api/me/appointments", {
    method: "POST",
    body: JSON.stringify(appointmentData),
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
  const response = await apiFetch<{ data: Clinic[] }>("/api/public/clinics");
  return response?.data ?? [];
};

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

type GetAvailabilityParams = {
  serviceId: string;
  clinicId: string;
  date: string; // YYYY-MM-DD
};

export type AvailabilityResponse = {
  availableSlots: string[];
  doctorsForSlot: Record<string, string[]>;
};

/**
 * Fetches doctor availability for a given service, clinic, and date.
 * @param params The service, clinic, and date to filter by.
 * @returns A promise that resolves to an object containing available slots and doctor mapping.
 */
export const getPublicAvailability = async (
  params: GetAvailabilityParams,
): Promise<AvailabilityResponse> => {
  const query = new URLSearchParams(params).toString();
  const response = await apiFetch<AvailabilityResponse>(`/api/public/availability?${query}`);
  // The backend already returns the correct shape, but if it's null/undefined, return a default empty state
  return response ?? { availableSlots: [], doctorsForSlot: {} };
};

/**
 * Fetches which dates are available for a given service and clinic.
 * @param params The clinic and service to filter by.
 * @returns A promise that resolves to an array of date strings (e.g., "2024-12-25").
 */
export const getPublicAvailableDates = async ({
  clinicId,
  serviceId,
}: {
  clinicId: string;
  serviceId: string;
}): Promise<string[]> => {
  const query = new URLSearchParams({ clinicId, serviceId }).toString();
  // This endpoint needs to be created in the backend. We assume it exists for now.
  const response = await apiFetch<{ data: string[] }>(`/api/public/available-dates?${query}`);
  return response?.data ?? [];
};

/**
 * Fetches available appointment slots for a given service at a specific clinic.
 * This uses the new backend slot-generation logic.
 * @param params The clinic and service to filter by.
 * @returns A promise that resolves to an array of availability slots.
 */
export const getPublicSlots = async ({
  clinicId,
  serviceId,
}: {
  clinicId: string;
  serviceId:string;
}): Promise<AvailabilitySlot[]> => {
  return apiFetch<AvailabilitySlot[]>(`/api/public/clinics/${clinicId}/slots?serviceId=${serviceId}`);
};

/**
 * Fetches all publicly available service categories.
 * @returns A promise that resolves to an array of service categories.
 */
export const getPublicServiceCategories = async (): Promise<ServiceCategory[]> => {
  return apiFetch<ServiceCategory[]>("/api/public/service-categories");
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