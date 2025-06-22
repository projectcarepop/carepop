import React, { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import api from '../../utils/api'; // Use the mobile app's pre-configured api client

interface ClerkSyncProviderProps {
  children: React.ReactNode;
}

export function ClerkSyncProvider({ children }: ClerkSyncProviderProps) {
  const { userId, isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn && userId) {
      const syncUser = async () => {
        try {
          // The empty body is expected for this POST request as the backend
          // gets the userId from the authenticated session via the JWT.
          // We pass an empty object as the second argument to satisfy axios.
          await api.post('/users/sync', {});
          // We can log this for debugging in development builds
          console.log('Mobile user sync completed successfully.');
        } catch (error) {
          // It's important to handle errors here, e.g., by logging them
          // to a service like Sentry or just console.error for development.
          console.error('Failed to sync mobile user with backend:', error);
        }
      };

      syncUser();
    }
  }, [userId, isSignedIn]); // Effect runs when the user's signed-in state or ID changes.

  return <>{children}</>;
} 