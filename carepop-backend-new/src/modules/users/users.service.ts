import { supabaseAdmin } from '../../lib/supabase';
import { clerkClient } from '../../lib/clerk';
import { ApiError } from '../../lib/errors';
import { type UpdateUserInput } from './users.validation';
import { type UpdateProfileInput } from '../profiles/profiles.validation';

async function getAllUsers() {
  // Step 1: Fetch profiles and roles from Supabase
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      created_at,
      user_roles (
        role
      )
    `)
    .order('created_at', { ascending: false });

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    throw new ApiError(500, 'Could not retrieve user profiles.');
  }
  if (!profiles) {
    return [];
  }

  // Step 2: Get user emails from Clerk, the source of truth for auth info
  const userIds = profiles.map(p => p.id);
  const clerkUsersResponse = await clerkClient.users.getUserList({ userId: userIds, limit: 500 });

  // Step 3: Create a map for efficient email lookup
  const emailMap = new Map<string, string | null>();
  clerkUsersResponse.data.forEach((user: { id: string; primaryEmailAddress: { emailAddress: string } | null | undefined; }) => {
    emailMap.set(user.id, user.primaryEmailAddress?.emailAddress ?? null);
  });

  // Step 4: Combine the data
  const combinedData = profiles.map(profile => {
    // The 'user_roles' is an array because of the one-to-many relationship.
    // We'll take the first role found, or default to 'user'.
    const role = (profile.user_roles as any[])?.[0]?.role || 'user';

    return {
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      created_at: profile.created_at,
      role: role,
      email: emailMap.get(profile.id) ?? null,
    };
  });

  return combinedData;
}

async function getUserById(userId: string) {
  const { data: user, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  if (error) {
    // Log the actual error for debugging, but return a generic message.
    console.error(`Error fetching user ${userId}:`, error);
    // If the error code indicates no rows were found, it's a 404.
    if (error.code === 'PGRST116') {
      throw new ApiError(404, 'User not found.');
    }
    // For other errors, throw a generic 500.
    throw new ApiError(500, 'Could not retrieve user.');
  }
  
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  return user;
}

async function updateUser(userId: string, input: UpdateUserInput) {
  // First, verify the user exists before attempting to update.
  await getUserById(userId);

  // We are updating the 'profiles' table which contains the role.
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw new ApiError(500, 'Could not update user.');
  }

  return data;
}

async function deleteUser(userId: string) {
  try {
    const deletedUser = await clerkClient.users.deleteUser(userId);
    return deletedUser;
  } catch (error: any) {
    // Check if the error is because the user is already deleted or not found.
    if (error.status === 404) {
        throw new ApiError(404, 'User not found in Clerk.');
    }
    // Handle other potential Clerk errors.
    console.error(`Error deleting user ${userId} from Clerk:`, error);
    throw new ApiError(500, 'Could not delete user.');
  }
}

export async function completeUserProfile(userId: string, input: UpdateProfileInput) {
  try {
    const { first_name, last_name, ...metadata } = input;

    // Use the backend SDK to update the user in Clerk
    const updatedUser = await clerkClient.users.updateUser(userId, {
      firstName: first_name,
      lastName: last_name,
      publicMetadata: {
        ...metadata,
        profileComplete: true,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error('Error completing user profile in Clerk:', error);
    // Forward a meaningful error to the client
    throw new ApiError(500, 'Could not update profile via Clerk service.');
  }
}

async function syncUser(
  clerkUserId: string,
  details: {
    email?: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  }
) {
  try {
    // 1. Check if user already exists in our 'profiles' table using supabase-js admin client.
    const { data: existingProfile, error: selectError } = await supabaseAdmin
      .from('profiles')
      .select('clerk_id')
      .eq('clerk_id', clerkUserId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 means "No rows found", which is not an error in this context.
      // We log and throw for any other unexpected database errors.
      console.error('Error selecting profile during sync:', selectError);
      throw new ApiError(500, 'Database error while checking for user.');
    }

    // 2. If the user profile already exists, do nothing and return.
    if (existingProfile) {
      return { status: 'exists', user: existingProfile };
    }

    // 3. If not, create a new profile in the database using the admin client.
    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        clerk_id: clerkUserId,
        first_name: details.firstName,
        last_name: details.lastName,
        avatar_url: details.imageUrl,
        // email is not in the profiles table by default, but we could add it.
        // For now, we rely on Clerk for the email.
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting new profile during sync:', insertError);
      throw new ApiError(500, 'Could not create user profile.');
    }

    if (!newProfile) {
      // This case should ideally not happen if the insert is successful.
      throw new Error('Failed to create profile, but no database error was thrown.');
    }

    return { status: 'created', user: newProfile };

  } catch (error: any) {
    // If it's already an ApiError, rethrow it. Otherwise, wrap it.
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Generic error during syncUser operation:', error);
    // Throw a generic 500 error to the client.
    throw new ApiError(500, 'Could not sync user profile with the database.');
  }
}

export const usersService = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  completeUserProfile,
  syncUser,
}; 