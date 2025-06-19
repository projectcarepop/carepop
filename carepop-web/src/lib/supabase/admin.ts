import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// IMPORTANT: This client is only for use in server-side actions and routes
// where elevated privileges are required to bypass RLS.
// It should NEVER be exposed to the client-side.

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Note: We are not throwing an error here if the keys are missing 
// to avoid breaking builds in environments where they might not be present.
// The server actions themselves will fail gracefully if the client is not configured.
export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
}); 