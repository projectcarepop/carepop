import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or Service Role Key is missing from environment variables.');
}

// Create a dedicated Supabase client for admin actions using the service role key.
// This client bypasses all RLS policies and should be used only in server-side code.
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    // Important: prevent the client from using browser storage for auth tokens
    persistSession: false,
    autoRefreshToken: false,
  },
}); 