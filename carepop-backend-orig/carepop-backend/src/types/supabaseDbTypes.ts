/**
 * Interface representing the structure of the 'profiles' table in Supabase.
 * This should be kept in sync with the actual database schema.
 */
export interface Profile {
  user_id: string; // Links to auth.users(id)
  username?: string | null;
  first_name?: string | null;
  middle_initial?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null; // Expected as 'YYYY-MM-DD' string from client, stored as DATE in DB
  age?: number | null; // Can be calculated or stored
  civil_status?: string | null;
  religion?: string | null;
  occupation?: string | null;
  contact_no?: string | null; // Preferred contact number by app
  phone_number?: string | null; // Original field from Supabase GoTrue, might be populated by auth
  street?: string | null;
  // address?: string | null; // Generic address field from initial schema, prefer granular below
  barangay_code?: string | null;
  city_municipality_code?: string | null;
  province_code?: string | null;
  philhealth_no?: string | null;
  avatar_url?: string | null;
  gender_identity?: string | null;
  pronouns?: string | null;
  assigned_sex_at_birth?: string | null; // Renamed from sex, for assigned sex at birth
  granular_consents?: Record<string, any> | null; // For storing various user consents
  created_at?: string; // TIMESTAMPTZ
  updated_at?: string | null; // TIMESTAMPTZ
}

// Add other database table interfaces here as they are defined and needed by the backend.
// For example:
// export interface Appointment {
//   appointment_id: string;
//   ...
// } 