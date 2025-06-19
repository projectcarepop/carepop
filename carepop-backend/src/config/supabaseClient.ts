import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables for local development.
// In Vercel, these will be set in the project settings.
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    throw new Error('Supabase environment variables are not fully set. Please check your .env file or Vercel project settings.');
}

// The publicly accessible client (uses anon key)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// The admin-level client for backend operations (uses service_role key)
const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey);

// This promise is now a simple resolved promise to maintain compatibility with server.ts
const supabaseInitializationPromise = Promise.resolve();

export {
  supabase,
  supabaseServiceRole,
  supabaseInitializationPromise
};

// This function is kept for any part of the code that might have used it,
// but it now simply returns the singleton anon client.
export const createSupabaseClientWithToken = (accessToken: string): SupabaseClient => {
  if (!supabaseUrl) {
    throw new Error('Supabase URL has not been initialized.');
  }
  // For server-side, we just return the main client.
  // The token would be handled by middleware if needed.
  return supabase;
}; 