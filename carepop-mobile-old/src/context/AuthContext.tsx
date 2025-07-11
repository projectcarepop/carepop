import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { getMyProfile } from '../services/api';
import { shouldSignOutOnError, logAuthError } from '../lib/auth-errors';
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
  updateProfileInContext: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced session validation
  const validateSession = useCallback(async (currentSession: Session): Promise<boolean> => {
    try {
      // Check if session is expired
      if (currentSession.expires_at && currentSession.expires_at * 1000 < Date.now()) {
        console.log('Session expired, attempting refresh...');
        const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
        
        if (error || !refreshedSession) {
          logAuthError(error || new Error('Session refresh failed'), 'session_validation');
          return false;
        }
        
        setSession(refreshedSession);
        return true;
      }
      
      return true;
    } catch (error) {
      logAuthError(error, 'session_validation');
      return false;
    }
  }, []);

  // Sign out function (defined early to avoid dependency issues)
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      // Auth state change listener will handle clearing session and profile
    } catch (error) {
      logAuthError(error, 'sign_out');
      // Force clear state even if signOut fails
      setSession(null);
      setProfile(null);
    }
  }, []);

  // Enhanced profile fetching with error handling
  const fetchProfileSafely = useCallback(async (userSession: Session): Promise<Profile | null> => {
    try {
      // Validate session before fetching profile
      const isValidSession = await validateSession(userSession);
      if (!isValidSession) {
        return null;
      }

      const fetchedProfile = await getMyProfile();
      return fetchedProfile;
    } catch (error) {
      logAuthError(error, 'profile_fetch');
      
      // If error suggests session is invalid, sign out
      if (shouldSignOutOnError(error)) {
        await signOut();
      }
      
      return null;
    }
  }, [validateSession, signOut]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);

        // 2. If session exists, fetch profile with validation
        if (initialSession?.user) {
          const fetchedProfile = await fetchProfileSafely(initialSession);
          setProfile(fetchedProfile);
        }
      } catch (error) {
        logAuthError(error, 'initial_auth_setup');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    // 3. Set up auth state listener with enhanced error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);

        if (newSession?.user) {
          // User signed in, fetch profile with validation
          const fetchedProfile = await fetchProfileSafely(newSession);
          setProfile(fetchedProfile);
        } else {
          // User signed out or session invalid
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

  const refreshSession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh error:', error);
        return false;
      }
      // The auth state change listener will handle updating the session
      return true;
    } catch (error) {
      console.error('Session refresh failed:', error);
      return false;
    }
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
      updateProfileInContext,
      signOut,
      refreshSession,
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