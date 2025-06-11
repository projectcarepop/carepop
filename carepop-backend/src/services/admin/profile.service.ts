import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase.types';
import { supabaseServiceRole } from '@/config/supabaseClient';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';

const supabase: SupabaseClient<Database> = supabaseServiceRole;

/**
 * Retrieves all user profiles and enriches them with email from the auth schema.
 * @returns A promise that resolves to an array of enriched profile objects.
 */
export const getAllProfiles = async (): Promise<any[]> => {
  // 1. Fetch all profiles from the public table
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select(
      `
      user_id,
      first_name,
      last_name,
      contact_no
    `
    );

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    throw new AppError(
      'Failed to fetch profiles from the database.',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  if (!profiles) {
    return [];
  }

  // 2. Fetch all users from the auth schema to get their emails
  const { data: authUsersData, error: authUsersError } =
    await supabase.auth.admin.listUsers();

  if (authUsersError) {
    console.error('Error fetching auth users:', authUsersError);
    throw new AppError(
      'Failed to fetch users from auth schema.',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }

  // 3. Create a map of emails with user_id as the key for efficient lookup
  const emailMap = new Map(
    authUsersData.users.map((user) => [user.id, user.email])
  );

  // 4. Merge the profile data with the auth email
  const enrichedProfiles = profiles.map((profile) => ({
    ...profile,
    email: emailMap.get(profile.user_id) || null, // Get email from map, or null if not found
  }));

  return enrichedProfiles;
}; 