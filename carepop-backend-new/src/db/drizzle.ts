import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { createClient } from '@supabase/supabase-js';

// Drizzle client for user-level access (respects RLS)
const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL or DIRECT_DATABASE_URL is not set in .env file');
}
export const client = postgres(connectionString, {
  ssl: 'require',
  // @ts-ignore - a valid parameter not yet in the type definitions
  family: 4, // Force IPv4 connection
});
export const db = drizzle(client, { schema });

// Official Supabase client for admin tasks (bypasses RLS)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in .env file');
}
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
}); 