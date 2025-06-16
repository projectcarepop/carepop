import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are set in your deployment environment.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or Service Role Key is not defined in environment variables. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
}

// Create a new Supabase client with the service role key.
// This client should ONLY be used in trusted server-side environments.
// It bypasses all RLS policies.
export const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // It's good practice to disable auto-refreshing tokens on the server.
    autoRefreshToken: false,
    persistSession: false,
  },
}); 