import { supabaseAdmin } from '../../lib/supabase';
import { ApiError } from '../../lib/errors';
import { type UpdateProfileInput } from './profiles.validation';

async function getProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new ApiError(404, 'Profile not found.');
  }

  return data;
}

async function updateProfile(userId: string, input: UpdateProfileInput) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Update profile error:', error);
    throw new ApiError(500, 'Could not update profile.');
  }

  return data;
}

export const profilesService = {
  getProfile,
  updateProfile,
}; 