import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase, Profile, getUserProfile } from '../utils/supabase'; // Adjust path as needed, added Profile, getUserProfile
import type { Session, User, AuthChangeEvent, SignUpWithPasswordCredentials } from '@supabase/supabase-js'; // Added AuthChangeEvent and SignUpWithPasswordCredentials

// No longer storing raw token directly from here, Supabase SDK handles it via SecureStoreAdapter

/**
 * Defines the shape of the authentication context.
 */
interface AuthContextType {
  /** 
   * True when the auth state is being determined (e.g., on app start, during login/logout). 
   * UI can use this to show loading indicators.
   */
  isLoading: boolean;
  /** The current authenticated Supabase session, or null if not authenticated. */
  session: Session | null;
  /** The current authenticated Supabase user object, or null if not authenticated. */
  user: User | null;
  /** 
   * The user's profile data from the 'profiles' table, or null if not fetched or not authenticated.
   * This is fetched after a session is established.
   */
  profile: Profile | null;
  /** 
   * Stores any error that occurred during an auth operation (e.g., profile fetch, sign out).
   * UI can use this to display error messages. Null if no error.
   */
  authError: Error | null;
  /** 
   * Signs the current user out.
   * Clears the session and user state.
   */
  signOut: () => Promise<void>;
  /**
   * Clears any existing authError.
   * UI can call this to dismiss an error message.
   */
  clearAuthError: () => void;
  // Add new signUp method
  signUpWithEmail: (credentials: SignUpWithPasswordCredentials) => Promise<{ user: User | null; error: Error | null }>;
  /**
   * Manually triggers a refresh of the user's profile data.
   */
  refreshUserProfile: () => Promise<void>;
}

/**
 * React Context for authentication state.
 * Provides access to session, user, profile, loading status, and signOut method.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Props for the AuthProvider component.
 */
interface AuthProviderProps {
  /** The child components that will have access to the auth context. */
  children: ReactNode;
}

/**
 * Provides authentication state to its children components.
 * Manages Supabase session, user profile, and loading states.
 * Listens to Supabase's onAuthStateChange to reactively update auth state.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize isLoading to true, as we start by checking the auth state.
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState<Error | null>(null);

  /**
   * Clears the authError state.
   */
  const clearAuthError = () => {
    setAuthError(null);
  };

  useEffect(() => {
    console.log('[AuthContext] useEffect init. Initial isLoading state:', isLoading); // Should be true here
    console.log('[AuthContext] Setting up onAuthStateChange listener...');
    
    // Ensure isLoading is true when the effect runs, in case of re-renders before initial check completes.
    // However, useState(true) above should handle the very first load.
    // This line might be redundant if the component structure ensures this effect only runs once.
    // For safety in complex scenarios, explicitly setting it here can be considered,
    // but typically the initial useState(true) is sufficient.
    // setIsLoading(true); // Re-evaluating if this is needed or if initial useState(true) is enough.

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`[AuthContext] onAuthStateChange event: ${event}`);
      console.log('[AuthContext] onAuthStateChange - currentSession user:', currentSession ? currentSession.user?.id || 'User object exists' : 'No session');
      
      setSession(currentSession);
      const currentUser = currentSession ? currentSession.user : null;
      setUser(currentUser);

      if (currentUser) {
        // Fetch profile only if the user has changed or if profile is not yet loaded for the current user.
        if (profile?.user_id !== currentUser.id) { 
          console.log('[AuthContext] Session active or changed, fetching profile for user:', currentUser.id);
          try {
            const fetchedProfile = await getUserProfile(currentUser.id);
            console.log('[AuthContext] Fetched profile:', fetchedProfile ? fetchedProfile.user_id : 'null');
            setProfile(fetchedProfile);
            if (event !== 'USER_UPDATED') { // Avoid clearing error on profile update if it was a specific profile update error
              setAuthError(null);
            }
          } catch (error) {
            console.error('[AuthContext] Error fetching profile:', error);
            setProfile(null); // Clear profile on error
            setAuthError(error instanceof Error ? error : new Error('Failed to fetch profile'));
          }
        } else {
          console.log('[AuthContext] Session active, profile already loaded for user:', currentUser.id);
        }
      } else {
        console.log('[AuthContext] No session from onAuthStateChange, clearing profile.');
        setProfile(null);
      }
      
      // This is the primary place to set isLoading to false after initial state is determined.
      console.log('[AuthContext] onAuthStateChange - Setting isLoading to false.');
      setIsLoading(false);
    });

    // Check initial session state. onAuthStateChange will also fire with 'INITIAL_SESSION'
    // if a session is found, or 'SIGNED_IN' if a redirect from OAuth just completed.
    // This explicit getSession() helps to set isLoading to false sooner if there's no session at all
    // and onAuthStateChange doesn't fire immediately for some reason (e.g. offline startup).
    console.log('[AuthContext] Checking initial Supabase session (supabase.auth.getSession())...');
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('[AuthContext] getSession() response - initialSession user:', initialSession ? initialSession.user?.id || 'User object exists' : 'No initial session');
      
      // If onAuthStateChange hasn't fired yet (e.g., no active session and listener is slow to report this),
      // and we find no initial session, we can confidently set isLoading to false.
      if (!initialSession && isLoading) { // isLoading check is important to avoid race with onAuthStateChange
        console.log('[AuthContext] getSession() - No initial session, and still loading. Setting isLoading to false.');
        setIsLoading(false);
        setAuthError(null); // Clear any potential error from a failed previous attempt if now resolved
      }
      // If a session IS found by getSession(), onAuthStateChange will handle it and set isLoading.
      // So, no need to duplicate setSession/setUser/setProfile logic here.
    }).catch(error => {
      console.error('[AuthContext] Error getting initial session:', error);
      // If getSession fails, it's critical to set isLoading to false so the app doesn't hang.
      console.log('[AuthContext] getSession() catch - Setting isLoading to false due to error.');
      if (isLoading) setIsLoading(false); // Ensure it only sets if still loading
      setAuthError(error instanceof Error ? error : new Error('Failed to get initial session'));
    });

    return () => {
      console.log('[AuthContext] Cleaning up onAuthStateChange listener.');
      authListener?.subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this runs once on mount

  const refreshUserProfile = async () => {
    if (!user) {
      console.log('[AuthContext] refreshUserProfile called but no user session found.');
      setProfile(null); // Ensure profile is cleared if no user
      return;
    }
    console.log('[AuthContext] refreshUserProfile called for user:', user.id);
    setIsLoading(true); // Indicate loading during profile refresh
    try {
      const fetchedProfile = await getUserProfile(user.id);
      console.log('[AuthContext] Profile refreshed:', fetchedProfile ? fetchedProfile.user_id : 'null');
      setProfile(fetchedProfile);
      setAuthError(null);
    } catch (error) {
      console.error('[AuthContext] Error refreshing profile:', error);
      // setProfile(null); // Optionally clear profile on refresh error, or keep stale data
      setAuthError(error instanceof Error ? error : new Error('Failed to refresh profile'));
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    console.log('[AuthContext] signOut called. Setting isLoading to true.');
    setIsLoading(true); // Set loading true before sign out
    try {
      await supabase.auth.signOut();
      // onAuthStateChange should fire with SIGNED_OUT, clearing session, user, profile and setting isLoading to false.
      console.log('[AuthContext] Supabase signOut successful.');
      setAuthError(null); // Clear previous errors on successful sign out
    } catch (error) {
      console.error('[AuthContext] Error during signOut:', error);
      console.log('[AuthContext] signOut catch - Setting isLoading to false due to error.');
      setIsLoading(false); // Ensure loading is false on error
      setAuthError(error instanceof Error ? error : new Error('Failed to sign out'));
    }
  };

  const signUpWithEmail = async (credentials: SignUpWithPasswordCredentials): Promise<{ user: User | null; error: Error | null }> => {
    console.log('[AuthContext] signUpWithEmail called. Setting isLoading to true.');
    setIsLoading(true);
    setAuthError(null);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp(credentials);

      if (signUpError) {
        console.error('[AuthContext] Supabase signUp error:', signUpError);
        setAuthError(signUpError);
        setIsLoading(false);
        return { user: null, error: signUpError };
      }

      if (signUpData.user) {
        // Check if Supabase indicates the user already exists (often by identities array being empty for a new unconfirmed user)
        // or if email_confirmed_at is null but identities is also empty.
        // This condition signifies that an account with this email might exist but is unconfirmed,
        // or it's a confirmed user trying to sign up again (Supabase creates a new unconfirmed auth entry).
        if (signUpData.user.identities && signUpData.user.identities.length === 0 && !signUpData.user.email_confirmed_at) {
          console.warn('[AuthContext] User with this email may already exist or needs confirmation.');
          const alreadyExistsError = new Error("An account with this email address already exists. Please try logging in, or check your email to confirm your existing account.");
          setAuthError(alreadyExistsError);
          // Attempt to sign out this newly created (but potentially problematic) user session
          await supabase.auth.signOut(); 
          setIsLoading(false);
          return { user: null, error: alreadyExistsError };
        }
        
        // If it's a genuinely new user, onAuthStateChange will handle setting user, session, and fetching profile.
        // The UI should then guide them to check their email for confirmation.
        console.log('[AuthContext] Supabase signUp successful for user:', signUpData.user.id);
        // isLoading will be set to false by onAuthStateChange when the session is processed.
        // No need to call setIsLoading(false) here if onAuthStateChange is robust.
        return { user: signUpData.user, error: null };
      }
      // Should not happen if signUpError is null and no user data, but as a fallback:
      setIsLoading(false);
      return { user: null, error: new Error('Unknown error during sign up.') };
    } catch (error) {
      console.error('[AuthContext] Catch-all error in signUpWithEmail:', error);
      const typedError = error instanceof Error ? error : new Error('An unexpected error occurred during sign up.');
      setAuthError(typedError);
      setIsLoading(false);
      return { user: null, error: typedError };
    }
  };

  console.log('[AuthContext] Rendering AuthProvider. isLoading:', isLoading, 'Session User:', session?.user?.id || 'null');

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        session,
        user,
        profile,
        authError,
        signOut,
        clearAuthError,
        signUpWithEmail,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access the AuthContext.
 * Throws an error if used outside of an AuthProvider.
 * @returns {AuthContextType} The authentication context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 