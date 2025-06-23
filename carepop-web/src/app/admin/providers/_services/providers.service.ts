import { supabaseAdmin } from "@/lib/supabase/admin";
import 'server-only';

async function getProviderById(providerId: string) {
  const { data, error } = await supabaseAdmin
    .from('providers')
    .select('*')
    .eq('id', providerId)
    .single();

  if (error) {
    console.error(`Error fetching provider by ID ${providerId}:`, error);
    return null;
  }
  return data;
}

export const providersService = {
  getProviderById,
}; 