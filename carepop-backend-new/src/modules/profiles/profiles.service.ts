import { supabaseAdmin } from '../../lib/supabase';
import { ApiError } from '../../lib/errors';
import { type UpdateProfileInput } from './profiles.validation';
import { clerkClient } from '../../lib/clerk';

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

    const { data: dbProfile, error } = await supabaseAdmin
      .from('profiles')
      .upsert(profileDataForDb, { onConflict: 'clerk_id' })
      .select()
      .single();

    if (error) {
      console.error('Upsert profile database error:', error);
      throw new ApiError(500, `Could not upsert profile: ${error.message}`);
    }

    // --- Start Clerk Sync with extra logging ---
    try {
      // Age must be calculated on the backend using the definitive date of birth
      // from the database to ensure it's always correct.
      const age = dbProfile.date_of_birth
        ? new Date(new Date().getTime() - new Date(dbProfile.date_of_birth).getTime()).getUTCFullYear() - 1970
        : 0;

      const metadataToSync = {
        profileComplete: true,
        middle_initial: dbProfile.middle_initial ?? '',
        date_of_birth: dbProfile.date_of_birth ?? '',
        contact_no: dbProfile.contact_no ?? '',
        gender_identity: dbProfile.gender_identity ?? '',
        pronouns: dbProfile.pronouns ?? '',
        assigned_sex_at_birth: dbProfile.assigned_sex_at_birth ?? '',
        civil_status: dbProfile.civil_status ?? '',
        religion: dbProfile.religion ?? '',
        occupation: dbProfile.occupation ?? '',
        philhealth_no: dbProfile.philhealth_no ?? '',
        street: dbProfile.street ?? '',
        province_code: dbProfile.province_code ?? '',
        city_municipality_code: dbProfile.city_municipality_code ?? '',
        barangay_code: dbProfile.barangay_code ?? '',
        age: age,
      };

      console.log('--- Clerk Sync Data ---');
      console.log('User ID:', userId);
      console.log('Metadata to Sync:', JSON.stringify(metadataToSync, null, 2));
      console.log('First Name:', dbProfile.first_name ?? '');
      console.log('Last Name:', dbProfile.last_name ?? '');
      console.log('-----------------------');

      // We MUST await this call in a serverless environment to ensure it completes
      // before the function execution is terminated.
      await clerkClient.users.updateUser(userId, {
        firstName: dbProfile.first_name ?? '',
        lastName: dbProfile.last_name ?? '',
        publicMetadata: metadataToSync,
      });

      console.log('Clerk sync successful for user:', userId);

    } catch (clerkError) {
      // If the Clerk sync fails, we log it but do not throw an error to the client.
      // This is a trade-off: the primary data is saved, but the UI might be stale
      // until the next successful sync. This is better than failing the whole operation.
      console.error('!!! CRITICAL: Clerk sync failed!', clerkError);
    }
    // --- End Clerk Sync ---

    return dbProfile;
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
  upsertProfile,
}; 