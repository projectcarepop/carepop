import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getMyProfile } from '../services/api';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '../lib/types';

// The status is now derived, not stored in state.
export type AuthStatus = 'loading' | 'unauthenticated' | 'no-profile' | 'authenticated';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  authStatus: AuthStatus;
  isLoading: boolean;
  updateProfileInContext: (profile: Profile | null) => void; // The correctly named manual updater
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      // 1. Get initial session
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);

      // 2. If session exists, fetch profile
      if (initialSession?.user) {
        try {
          const fetchedProfile = await getMyProfile();
          setProfile(fetchedProfile);
        } catch (error) {
          console.error("Auth provider failed to fetch initial profile:", error);
          setProfile(null);
        }
      }
      setIsLoading(false);
    };

    fetchInitialData();

    // 3. Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);

        if (newSession?.user) {
            try {
                // Refetch profile when auth state changes (e.g., login)
                const fetchedProfile = await getMyProfile();
                setProfile(fetchedProfile);
            } catch (error) {
                console.error("Auth provider failed to fetch profile on auth change:", error);
                setProfile(null);
            }
        } else {
          // User is signed out
          setProfile(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const updateProfileInContext = (newProfile: Profile | null) => {
    setProfile(newProfile);
  };

  const value = useMemo(() => {
    let authStatus: AuthStatus;

    if (isLoading) {
      authStatus = 'loading';
    } else if (!session?.user) {
      authStatus = 'unauthenticated';
    } else if (!profile?.firstName) { // Check is on the camelCase property
      authStatus = 'no-profile';
    } else {
      authStatus = 'authenticated';
    }
    
    return {
      session,
      user: session?.user ?? null,
      profile,
      authStatus,
      isLoading,
      updateProfileInContext, // Expose the correctly named function
    };
  }, [session, profile, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 