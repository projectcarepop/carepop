import { createClient } from '@supabase/supabase-js';
import { config } from '@/config/index';

const supabaseUrl = config.supabase.url;
const supabaseKey = config.supabase.anonKey;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseKey); 