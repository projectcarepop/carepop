import { supabase } from '@/config/supabaseClient';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';

export const getUserProfileService = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select(
      `
      user_id,
      first_name,
      middle_initial,
      last_name,
      date_of_birth,
      age,
      civil_status,
      religion,
      occupation,
      street,
      barangay_code,
      city_municipality_code,
      province_code,
      contact_no,
      philhealth_no,
      gender_identity,
      pronouns,
      assigned_sex_at_birth,
      avatar_url,
      user_roles (
        role
      )
    `
    )
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore 'not found' error, it's handled in controller
    throw new AppError('Error fetching profile', StatusCodes.INTERNAL_SERVER_ERROR, error);
  }

  // Flatten the role from the join
  if (profile) {
    const userRole = Array.isArray(profile.user_roles) ? profile.user_roles[0]?.role : null;
    const { user_roles, ...rest } = profile;
    return { ...rest, role: userRole };
  }

  return null;
}; 