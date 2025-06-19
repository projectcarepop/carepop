import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// IMPORTANT: This client is only for use in server-side actions and routes
// where elevated privileges are required to bypass RLS.
// It should NEVER be exposed to the client-side.

// This is a proxy-based solution to lazy-load the Supabase admin client.
// The actual Supabase client is only created on the first access
// to any of its properties. This prevents the client from being initialized
// during the build process, where environment variables might not be available.

let client: SupabaseClient<Database> | null = null;

const getClient = () => {
  if (!client) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase server-side environment variables are not set.');
    }

    client = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return client;
};

export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    return Reflect.get(getClient(), prop);
  }
}); 