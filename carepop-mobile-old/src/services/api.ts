import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase"; // Import the singleton client
import type {
  Clinic,
  DetailedAppointment,
  MedicalRecord,
  NewAppointment,
  Profile,
  Service,
  UpdateProfilePayload,
  AvailabilitySlot,
} from "../lib/types";
import type { RegisterFormValues, LoginFormValues } from '../lib/validation/auth';

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
async function apiFetch(path: string, options: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    // Merge existing headers
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
      const errorBody = await response.json();
      // Create a more informative error
      const message = errorBody.error || `API request failed with status ${response.status}`;
      const error = new Error(message);
      // You can attach more context to the error if needed
      // (error as any).status = response.status;
      throw error;
    } catch (e) {
      // If parsing the error body fails, throw a generic error
      if (e instanceof Error) {
        throw e; // re-throw the informative error from the try block
      }
      throw new Error(`API request failed with status ${response.status}`);
    }
  }

  // Handle responses with no content (e.g., 204 for DELETE)
  if (response.status === 204) {
    return null;
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
// AUTHENTICATED ROUTES (require a Supabase client instance)
// ============================================================================

/**
 * Retrieves the appointments for the currently authenticated user.
 * @returns A promise that resolves to an array of detailed appointments.
 */
export const getMyAppointments = async (): Promise<DetailedAppointment[]> => {
  return apiFetch("/api/me/appointments", {
    method: "GET",
  });
};

/**
 * Updates the profile for the currently authenticated user.
 * @param payload The partial profile data to update.
 * @returns A promise that resolves to the updated user profile.
 */
export const updateMyProfile = async (payload: UpdateProfilePayload): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  await supabaseCall(
    supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id)
  );
};

/**
 * Retrieves the medical records for the currently authenticated user.
 * @returns A promise that resolves to an array of medical records.
 */
export const getMyMedicalRecords = async (): Promise<MedicalRecord[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const records = await supabaseCall(
    supabase
      .from("medical_records")
      .select("*")
      .eq("user_id", user.id)
  );
  return records ?? [];
};

/**
 * Creates a new appointment for the currently authenticated user.
 * @param appointmentData The data for the new appointment.
 * @returns A promise that resolves to the newly created detailed appointment.
 */
export const createAppointment = async (
  appointmentData: NewAppointment,
): Promise<DetailedAppointment> => {
  return apiFetch("/api/me/appointments", {
    method: "POST",
    body: JSON.stringify(appointmentData),
  });
};

/**
 * Fetches an AI insight based on the user's health logs.
 * @returns A promise that resolves to an object containing the AI insight.
 */
export const getAiInsight = async (): Promise<{ insight: string }> => {
  return apiFetch("/api/me/ai/insight", {
    method: "POST", // Assuming this is a POST as it may involve sending data
  });
};

// ============================================================================
// PUBLIC ROUTES (do not require authentication)
// ============================================================================

/**
 * Fetches all publicly available clinics.
 * @param serviceId Optional service ID to filter clinics by.
 * @returns A promise that resolves to an array of clinics.
 */
export const getPublicClinics = async (): Promise<Clinic[]> => {
  const clinics = await supabaseCall(supabase.from('clinics').select('*'));
  return clinics ?? [];
};

/**
 * Fetches all publicly available services.
 * @returns A promise that resolves to an array of services.
 */
export const getPublicServices = async (): Promise<Service[]> => {
  const services = await supabaseCall(supabase.from('services').select('*'));
  return services ?? [];
};

type GetAvailabilityParams = {
  serviceId: string;
  clinicId: string;
  date: string; // YYYY-MM-DD
};

/**
 * Fetches doctor availability for a given service, clinic, and date.
 * @param params The service, clinic, and date to filter by.
 * @returns A promise that resolves to an array of availability slots.
 */
export const getPublicAvailability = async (
  params: GetAvailabilityParams,
): Promise<AvailabilitySlot[]> => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/api/public/availability?${query}`);
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

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    // This function has custom error handling to allow for a non-existent profile,
    // which is a valid state. Therefore, it does not use the `supabaseCall` helper.
    if (error.code === 'PGRST116') { // PGRST116 is the code for "Not Found"
      return null;
    }
    throw new Error(error.message);
  }

  return data;
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

export type HealthLogPayload = {
  mood: string;
  symptoms: string[];
  notes?: string;
};

export const logHealthData = async (payload: HealthLogPayload): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  await supabaseCall(supabase.from('health_logs').insert({
    user_id: user.id,
    ...payload,
  }));
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