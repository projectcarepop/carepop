import 'react-native-url-polyfill/auto'; // Required for Supabase JS V2
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Ensure your environment variables are configured correctly in app.json -> extra
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('**************************************************************************');
  console.error('*** ERROR: Supabase URL or Anon Key is missing. Check app.json extra ***');
  console.error('**************************************************************************');
  // Optionally throw an error, but logging might be safer for initial load
  // throw new Error('Supabase URL or Anon Key missing');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    storage: AsyncStorage, // Use AsyncStorage for session storage in React Native
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
}

// --- getUserProfile Function ---
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  if (!userId) return null;

  try {
    const { data, error, status } = await supabase
      .from('profiles')
      .select(`*`) // Select all profile fields
      .eq('user_id', userId)
      .single();

    if (error && status !== 406) {
      console.error('[getUserProfile] Error fetching profile:', error);
      // Rethrow or handle as needed
      // throw error;
      return null;
    }

    if (data) {
      return data as Profile;
    }

    // No profile found for the user ID
    return null;

  } catch (error) {
    // Log the raw error first to see its structure, in case console.error causes issues
    console.log('[getUserProfile] Raw error object:', JSON.stringify(error, null, 2)); 
    console.error('[getUserProfile] Unexpected error during profile fetch:', error);
    return null;
  }
}; 