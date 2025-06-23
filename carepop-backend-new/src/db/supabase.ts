import { createClient } from '@supabase/supabase-js';
import { env } from '../config';

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY); 