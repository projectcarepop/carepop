import { createClient } from '@supabase/supabase-js';
import config from '@/config/config';

const supabaseUrl = config.supabaseUrl;
const supabaseKey = config.supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Anon Key must be provided.');
}

export const supabase = createClient(supabaseUrl, supabaseKey); 