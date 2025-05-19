import 'react-native-url-polyfill/auto'; // Required for Supabase JS V2
// import AsyncStorage from '@react-native-async-storage/async-storage'; // No longer using AsyncStorage directly for Supabase client
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Ensure your environment variables are configured correctly in app.json -> extra
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

// Retrieve the backend API URL from app.json extra
const EXPO_PUBLIC_BACKEND_API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('**************************************************************************');
  console.error('*** ERROR: Supabase URL or Anon Key is missing. Check app.json extra ***');
  console.error('**************************************************************************');
  // Optionally throw an error, but logging might be safer for initial load
  // throw new Error('Supabase URL or Anon Key missing');
}

if (!EXPO_PUBLIC_BACKEND_API_URL) {
  console.error('*********************************************************************************');
  console.error('*** ERROR: EXPO_PUBLIC_BACKEND_API_URL is missing in app.json extra field ***');
  console.error('*********************************************************************************');
}

// Adapter for expo-secure-store to be used by Supabase
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    SecureStore.deleteItemAsync(key);
  },
};

// Create the Supabase client
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    storage: ExpoSecureStoreAdapter, // Use ExpoSecureStoreAdapter for session storage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for React Native, URL session detection is for web
  },
});

// --- Define Profile Type (Matches the extended DB schema) ---
export interface Profile {
  user_id: string; // From existing schema
  username: string | null; // From existing schema, often email or a chosen username
  
  // Fields from the initial migration (ensure types match)
  first_name: string | null; // Was TEXT
  last_name: string | null;  // Was TEXT
  date_of_birth: string | null; // Was DATE, Supabase JS client typically handles as string YYYY-MM-DD
  phone_number: string | null; // Was TEXT UNIQUE (app uses contact_no, consider alignment)
  address: string | null; // Was TEXT (generic, now using granular fields below)
  granular_consents: Record<string, any> | null; // Was JSONB, Record<string, any> is a good TS equivalent
  created_at: string; // Was TIMESTAMPTZ
  updated_at: string | null; // Was TIMESTAMPTZ

  // Newly added fields from YYYYMMDDHHMMSS_add_detailed_profile_fields.sql
  middle_initial: string | null;
  avatar_url: string | null;
  age: number | null; // Was INT4
  civil_status: string | null;
  religion: string | null;
  occupation: string | null;
  contact_no: string | null; // App-preferred contact field
  street: string | null;
  barangay_code: string | null;
  city_municipality_code: string | null;
  province_code: string | null;
  philhealth_no: string | null;

  // SOGIE related fields
  gender_identity: string | null;
  pronouns: string | null;
  assigned_sex_at_birth: string | null;
}

// --- getUserProfile Function ---
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  // userId is passed but currently not directly used if fetching via backend using session token.
  // It's good to have for context or direct Supabase calls if ever reinstated.
  console.log(`[getUserProfile] Attempting to fetch profile (userId hint: ${userId || 'N/A'}) via backend API.`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn('[getUserProfile] API call timed out.');
    controller.abort();
  }, 15000); // 15 second timeout

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.warn('[getUserProfile] Error getting session for API call:', sessionError.message);
      clearTimeout(timeoutId);
      return null;
    }

    if (!sessionData.session) {
      console.log('[getUserProfile] No active Supabase session found. Cannot fetch profile via backend API.');
      clearTimeout(timeoutId);
      return null;
    }
    const activeSession = sessionData.session;

    const backendApiUrl = EXPO_PUBLIC_BACKEND_API_URL; // Use the value read via Constants
    if (!backendApiUrl) {
      console.error('[getUserProfile] Backend API URL (from app.json extra) is not configured or is null/undefined.');
      clearTimeout(timeoutId);
      return null;
    }

    console.log(`[getUserProfile] Fetching from backend: ${backendApiUrl}/api/users/profile`);
    const response = await fetch(`${backendApiUrl}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeSession.access_token}`,
      },
      signal: controller.signal, // Attach the abort signal
    });

    clearTimeout(timeoutId); // Clear the timeout if the request completes

    if (!response.ok) {
      let errorResponseMessage = `Failed to fetch profile from backend. Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorResponseMessage = errorData.message || errorResponseMessage;
        console.warn(`[getUserProfile] Backend error fetching profile. Status: ${response.status}`, errorData);
      } catch (e) {
        console.warn(`[getUserProfile] Backend error fetching profile. Status: ${response.status}. Could not parse error JSON.`);
      }
      // No explicit return null here, will fall through to the end or be caught
      // Forcing a return null if !response.ok
      return null;
    }

    const responseData = await response.json();
    
    if (responseData && responseData.data && typeof responseData.data === 'object') {
      console.log('[getUserProfile] Profile successfully fetched and parsed from backend (nested).');
      return responseData.data as Profile;
    } else if (responseData && typeof responseData === 'object') { 
      if ('user_id' in responseData) {
         console.log('[getUserProfile] Profile successfully fetched and parsed from backend (root).');
         return responseData as Profile;
      }
    }
    
    console.warn('[getUserProfile] Fetched profile data from backend is not in expected format:', responseData);
    return null;

  } catch (error: any) { // Changed to any to inspect error.name for AbortError
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('[getUserProfile] Profile fetch aborted due to timeout.');
    } else {
      console.error('[getUserProfile] Unexpected exception during profile fetch process:', error);
    }
    return null;
  }
}; 