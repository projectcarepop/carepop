import { AppError } from '@/lib/utils/appError';
import { supabase } from '@/lib/supabase/client';
import { StatusCodes } from 'http-status-codes';

export class UserService {
  /**
   * Fetches a user's profile by their ID.
   * @param userId The UUID of the user.
   * @returns The user's profile.
   */
  public async getUserProfile(userId: string) {
    if (!userId) {
      throw new AppError('User ID is required.', StatusCodes.BAD_REQUEST);
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error(`Error fetching profile for user ${userId}:`, error);
      if (error.code === 'PGRST116') {
        throw new AppError('Profile not found.', StatusCodes.NOT_FOUND);
      }
      throw new AppError('Failed to fetch user profile.', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    if (!profile) {
      throw new AppError('Profile not found.', StatusCodes.NOT_FOUND);
    }

    return profile;
  }
} 