import { createClient } from '@supabase/supabase-js';
import config from '@/config/config';

const supabaseUrl = config.supabaseUrl;
const supabaseServiceRoleKey = config.supabaseServiceRoleKey;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL and Service Role Key must be provided.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey); 