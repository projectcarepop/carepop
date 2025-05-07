import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase, Profile, getUserProfile } from '../utils/supabase'; // Adjust path as needed, added Profile, getUserProfile
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'; // Added AuthChangeEvent

// No longer storing raw token directly from here, Supabase SDK handles it via SecureStoreAdapter

interface AuthContextType {
  isLoading: boolean; // True while checking initial session, and during auth operations
  session: Session | null;
  user: User | null;
  profile: Profile | null; // Added profile
  // Expose Supabase client's signIn, signUp, signOut directly or wrap them
  // For simplicity, we can let screens call supabase.auth.signInWithPassword directly
  // and this context will react to onAuthStateChange.
  // Or, provide wrapped methods:
  // signUp: typeof supabase.auth.signUp; // Example, if you want to re-export
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    console.log('[AuthContext] useEffect init. Initial isLoading state:', isLoading);
    console.log('[AuthContext] Setting up onAuthStateChange listener...');
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`[AuthContext] onAuthStateChange event: ${event}`);
      console.log('[AuthContext] onAuthStateChange - currentSession user:', currentSession ? currentSession.user?.id || 'User object exists' : 'No session');
      console.log('[AuthContext] onAuthStateChange - session state *before* update:', session ? session.user?.id : 'null');

      setSession(currentSession);
      setUser(currentSession ? currentSession.user : null);

      if (currentSession?.user) {
        if (profile?.user_id !== currentSession.user.id) { // Fetch only if profile is not set or for a different user
          console.log('[AuthContext] Session exists or changed, fetching profile for user:', currentSession.user.id);
          const fetchedProfile = await getUserProfile(currentSession.user.id);
          console.log('[AuthContext] Fetched profile:', fetchedProfile ? fetchedProfile.user_id : 'null');
          setProfile(fetchedProfile);
        } else {
          console.log('[AuthContext] Session exists, profile already loaded for user:', currentSession.user.id);
        }
      } else {
        console.log('[AuthContext] No session from onAuthStateChange, clearing profile.');
        setProfile(null);
      }
      
      console.log('[AuthContext] onAuthStateChange - Setting isLoading to false.');
      setIsLoading(false);
    });

    console.log('[AuthContext] Checking initial Supabase session (supabase.auth.getSession())...');
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('[AuthContext] getSession() response - initialSession user:', initialSession ? initialSession.user?.id || 'User object exists' : 'No initial session');
      // onAuthStateChange with INITIAL_SESSION or SIGNED_IN should handle setting the session and profile.
      // We mainly use this to ensure isLoading is false if no session is found initially and onAuthStateChange doesn't fire immediately.
      if (!initialSession && isLoading) {
        console.log('[AuthContext] getSession() - No initial session, and isLoading is true. Setting isLoading to false.');
        setIsLoading(false);
      } else if (initialSession && isLoading) {
        console.log('[AuthContext] getSession() - Initial session found, but onAuthStateChange should handle it. Current isLoading:', isLoading);
        // If onAuthStateChange hasn't fired yet to set isLoading to false, we might do it here.
        // However, it is safer to let onAuthStateChange manage it to avoid race conditions.
      } else {
        console.log('[AuthContext] getSession() - isLoading already false or session handled. Current isLoading:', isLoading);
      }
    }).catch(error => {
      console.error('[AuthContext] Error getting initial session:', error);
      console.log('[AuthContext] getSession() catch - Setting isLoading to false due to error.');
      setIsLoading(false);
    });

    return () => {
      console.log('[AuthContext] Cleaning up onAuthStateChange listener.');
      authListener?.subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount

  const signOut = async () => {
    console.log('[AuthContext] signOut called. Setting isLoading to true.');
    setIsLoading(true); // Set loading true before sign out
    try {
      await supabase.auth.signOut();
      // onAuthStateChange should fire with SIGNED_OUT, clearing session, user, profile and setting isLoading to false.
      console.log('[AuthContext] Supabase signOut successful.');
    } catch (error) {
      console.error('[AuthContext] Error during signOut:', error);
      console.log('[AuthContext] signOut catch - Setting isLoading to false due to error.');
      setIsLoading(false); // Ensure loading is false on error
    }
  };

  console.log('[AuthContext] Rendering AuthProvider. isLoading:', isLoading, 'Session User:', session?.user?.id || 'null');

  return (
    <AuthContext.Provider value={{ isLoading, session, user, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 