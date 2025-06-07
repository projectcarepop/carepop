import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase.types';
import { supabaseServiceRole } from '../../config/supabaseClient';
import { AppError } from '../../utils/errors';

export class ProfileAdminService {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = supabaseServiceRole;
  }

  async getAllProfiles(): Promise<any[]> {
    // 1. Fetch all profiles from the public table
    const { data: profiles, error: profilesError } = await this.supabase
      .from('profiles')
      .select(`
        user_id,
        first_name,
        last_name,
        contact_no
      `);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw new AppError('Failed to fetch profiles from the database.', 500);
    }
    
    if (!profiles) {
        return [];
    }

    // 2. Fetch all users from the auth schema to get their emails
    const { data: authUsersData, error: authUsersError } = await this.supabase.auth.admin.listUsers();

    if (authUsersError) {
        console.error('Error fetching auth users:', authUsersError);
        throw new AppError('Failed to fetch users from auth schema.', 500);
    }

    // 3. Create a map of emails with user_id as the key for efficient lookup
    const emailMap = new Map(
        authUsersData.users.map(user => [user.id, user.email])
    );

    // 4. Merge the profile data with the auth email
    const enrichedProfiles = profiles.map(profile => ({
      ...profile,
      email: emailMap.get(profile.user_id) || null, // Get email from map, or null if not found
    }));

    return enrichedProfiles;
  }
} 