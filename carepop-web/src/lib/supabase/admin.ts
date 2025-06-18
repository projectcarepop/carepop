import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Create a function to get the admin client.
// This prevents the environment variables from being checked at build time.
export const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase URL or Service Role Key is missing from environment variables.');
    }
    
    // Create and return a new client instance.
    return createClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
            // Important: prevent the client from using browser storage for auth tokens
            persistSession: false,
            autoRefreshToken: false,
        },
    });
};

// Deprecated: Do not use directly. Use getSupabaseAdmin() instead.
// This direct export is the cause of the build error.
export const supabaseAdmin = null; 