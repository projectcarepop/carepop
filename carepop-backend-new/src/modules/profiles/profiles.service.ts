import { supabaseAdmin } from '../../lib/supabase';
import { ApiError } from '../../lib/errors';
import { type UpdateProfileInput } from './profiles.validation';

async function getProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('clerkId', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Get profile error:', error);
    throw new ApiError(500, `Could not retrieve profile: ${error.message}`);
  }

  return data;
}

async function updateProfile(userId: string, input: UpdateProfileInput) {
  try {
    const profileDataForDb = {
        firstName: input.first_name,
        lastName: input.last_name,
        middleInitial: input.middle_initial,
        dateOfBirth: input.date_of_birth,
        contactNo: input.contact_no,
        genderIdentity: input.gender_identity,
        pronouns: input.pronouns,
        assignedSexAtBirth: input.assigned_sex_at_birth,
        civilStatus: input.civil_status,
        religion: input.religion,
        occupation: input.occupation,
        philhealthNo: input.philhealth_no,
        street: input.street,
        provinceCode: input.province_code,
        cityMunicipalityCode: input.city_municipality_code,
        barangayCode: input.barangay_code,
    };

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(profileDataForDb)
      .eq('clerkId', userId)
      .select()
      .single();

    if (error) {
      console.error('Update profile database error:', error);
      throw new ApiError(500, `Could not update profile: ${error.message}`);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Unexpected error in updateProfile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new ApiError(500, `An unexpected error occurred: ${errorMessage}`);
  }
}

export const profilesService = {
  getProfile,
  updateProfile,
}; 