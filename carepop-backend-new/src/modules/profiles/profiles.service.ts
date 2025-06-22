import { supabaseAdmin } from '../../lib/supabase';
import { ApiError } from '../../lib/errors';
import { type UpdateProfileInput } from './profiles.validation';

async function getProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Get profile error:', error);
    throw new ApiError(500, `Could not retrieve profile: ${error.message}`);
  }

  return data;
}

async function upsertProfile(userId: string, input: UpdateProfileInput) {
  try {
    const profileDataForDb = {
        clerk_id: userId,
        first_name: input.first_name,
        last_name: input.last_name,
        middle_initial: input.middle_initial,
        date_of_birth: input.date_of_birth,
        contact_no: input.contact_no,
        gender_identity: input.gender_identity,
        pronouns: input.pronouns,
        assigned_sex_at_birth: input.assigned_sex_at_birth,
        civil_status: input.civil_status,
        religion: input.religion,
        occupation: input.occupation,
        philhealth_no: input.philhealth_no,
        street: input.street,
        province_code: input.province_code,
        city_municipality_code: input.city_municipality_code,
        barangay_code: input.barangay_code,
    };

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert(profileDataForDb, { onConflict: 'clerk_id' })
      .select()
      .single();

    if (error) {
      console.error('Upsert profile database error:', error);
      throw new ApiError(500, `Could not upsert profile: ${error.message}`);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Unexpected error in upsertProfile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new ApiError(500, `An unexpected error occurred: ${errorMessage}`);
  }
}

export const profilesService = {
  getProfile,
  updateProfile: upsertProfile,
}; 