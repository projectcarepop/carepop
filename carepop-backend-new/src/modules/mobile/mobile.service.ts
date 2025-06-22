import { clerkClient } from '../../lib/clerk';
import { ApiError } from '../../lib/errors';
import { type UpdateProfileInput } from '../profiles/profiles.validation';

async function completeMobileUserProfile(
  userId: string,
  input: UpdateProfileInput
) {
  try {
    const { first_name, last_name, ...rest } = input;

    // Clerk's publicMetadata does not accept `null` values from the mobile client.
    // We must filter them out before sending the request to avoid a hanging request.
    const metadata: Record<string, any> = {};
    for (const key in rest) {
      if (Object.prototype.hasOwnProperty.call(rest, key)) {
        const value = (rest as any)[key];
        if (value !== null && value !== undefined) {
          metadata[key] = value;
        }
      }
    }

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
    console.error('Error completing mobile user profile in Clerk:', error);
    // Forward a meaningful error to the client
    throw new ApiError(500, 'Could not update mobile profile via Clerk service.');
  }
}

export const mobileService = {
  completeMobileUserProfile,
}; 