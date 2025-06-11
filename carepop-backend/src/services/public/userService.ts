import { AppError } from '@/lib/utils/appError';
import { supabase } from '@/lib/supabase/client';
import { StatusCodes } from 'http-status-codes';

export class UserService {
  /**
   * Finds a user's profile from the public.profiles table using their auth ID.
   * This is the CORRECT way to fetch application-specific user data.
   * @param userId The user's UUID from the JWT ('sub' claim).
   * @returns The user profile object or null if not found.
   */
  public async findProfileById(userId: string): Promise<any | null> {
    if (!userId) {
      throw new AppError('User ID must be provided to fetch a profile.', StatusCodes.BAD_REQUEST);
    }

    // We query the 'profiles' table and match the 'user_id' column with the user ID from the token.
    const { data, error } = await supabase
      .from('profiles')
      .select('*') // Select all profile data
      .eq('user_id', userId) // Using the correct 'user_id' column from the schema
      .single(); // Use .single() to get one object or null, not an array.

    // If Supabase returns an error (but not a "no rows found" error), it's a server issue.
    if (error && error.code !== 'PGRST116') { // PGRST116 is the code for "no rows found"
      console.error('Supabase error fetching profile:', error);
      throw new AppError('Failed to retrieve user profile from the database.', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    // `data` will be the profile object if found, or `null` if the row doesn't exist.
    return data;
  }
} 