import { createClient, SupabaseClient } from '@supabase/supabase-js'

// This file provides a function to get a server-side Supabase client
// with elevated privileges. It uses the SERVICE_ROLE_KEY and should be
// used with extreme caution.
//
// IMPORTANT: RLS is bypassed when using this client. Ensure your queries
// are secure and do not expose sensitive data unintentionally.
//
// Do not expose this to the browser.

// We use a singleton pattern to ensure we only create one instance of the client.
let supabaseAdmin: SupabaseClient | undefined;

export function getSupabaseAdmin() {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL or Service Role Key is not defined. Check your environment variables.');
  }

  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
} 