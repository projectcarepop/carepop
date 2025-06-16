'use server';

import { createClient } from '@/utils/supabase/server';

export async function getUserDetails(userId: string) {
  const supabase = createClient();

  const { data: profile, error } = await supabase
    .from('users_view')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return { profile: null };
  }

  return { profile };
} 