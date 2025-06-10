import { supabase } from '@/lib/supabase/client';
import { ApiError } from '@/utils/ApiError';

export class UserService {
  /**
   * Fetches a user's profile by their ID.
   * @param userId The UUID of the user.
   * @returns The user's profile.
   */
  public async getUserProfile(userId: string) {
    if (!userId) {
      throw new ApiError(400, 'User ID is required.');
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      if (error.code === 'PGRST116') {
        throw new ApiError(404, 'Profile not found.');
      }
      throw new ApiError(500, 'Failed to fetch user profile.');
    }

    if (!profile) {
      throw new ApiError(404, 'Profile not found.');
    }

    return profile;
  }
} 