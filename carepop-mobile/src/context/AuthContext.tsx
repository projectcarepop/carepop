import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase, Profile, getUserProfile } from '../utils/supabase'; // Adjust path as needed, added Profile, getUserProfile
import type { Session, User, SignUpWithPasswordCredentials, SignInWithPasswordCredentials } from '@supabase/supabase-js'; // Added SignInWithPasswordCredentials, Removed AuthChangeEvent
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession(); // Required for web and OAuth redirects

const redirectTo = makeRedirectUri();

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
  /** True if a user has signed up but is awaiting email confirmation. */
  isAwaitingEmailConfirmation: boolean;
  /** True if the user has completed the onboarding flow. Null while checking. */
  hasCompletedOnboarding: boolean | null;
  /**
   * Signs in a user with their email and password.
   * @param {SignInWithPasswordCredentials} credentials - The user's email and password.
   * @returns {Promise<{ user: User | null; error: Error | null }>} An object containing the user data on success or an error on failure.
   */
  signInWithPassword: (credentials: SignInWithPasswordCredentials) => Promise<{ user: User | null; error: Error | null }>;
  /**
   * Signs up a new user with their email and password.
   * @param {SignUpWithPasswordCredentials} credentials - The user's email and password.
   * @returns {Promise<{ user: User | null; error: Error | null }>} An object containing the user data on success or an error on failure.
   * Note: Successful sign-up typically requires email confirmation.
   */
  signUpWithEmail: (credentials: SignUpWithPasswordCredentials) => Promise<{ user: User | null; error: Error | null }>;
  /**
   * Initiates the Google OAuth sign-in flow.
   * Opens a web browser for the user to authenticate with Google.
   * @returns {Promise<void>}
   */
  signInWithGoogle: () => Promise<void>;
  /** 
   * Signs the current user out.
   * Clears the session and user state.
   * @returns {Promise<void>}
   */
  signOut: () => Promise<void>;
  /**
   * Clears any existing authError.
   * UI can call this to dismiss an error message.
   */
  clearAuthError: () => void;
  /**
   * Manually triggers a refresh of the user's profile data.
   * @returns {Promise<void>}
   */
  refreshUserProfile: () => Promise<void>;
  /**
   * Manually sets the user's profile data in the context.
   * @param {Profile | null} newProfile - The new profile data.
   */
  manuallySetProfile: (newProfile: Profile | null) => void;
  isSaving: boolean;
  /**
   * Updates a user's profile data and optionally their avatar.
   * @param {{ userId: string; updates: Partial<Profile>; avatarUri?: string | null }} params
   * @returns {Promise<boolean>} True on success, false on failure.
   */
  updateProfile: (params: {
    updates: Partial<Profile>;
  }) => Promise<boolean>;
  /**
   * Creates or updates a user's profile data.
   * @param {{ userId: string; updates: Partial<Profile> }} params
   * @returns {Promise<boolean>} True on success, false on failure.
   */
  createProfile: (params: {
    userId: string;
    updates: Partial<Profile>;
  }) => Promise<boolean>;
  /**
   * Marks the onboarding process as complete.
   * @returns {Promise<void>}
   */
  completeOnboarding: () => Promise<void>;
}

/**
 * React Context for authentication state.
 * Provides access to session, user, profile, loading status, and auth methods.
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
 * Provides authentication state and methods to its children components.
 * Manages Supabase session, user profile, and loading states.
 * Listens to Supabase's onAuthStateChange to reactively update auth state.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Use expo-constants to read from app.json extra for debug logging
  const backendApiUrlFromConstants = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
  console.log("[AuthContext] DEBUG from Constants: EXPO_PUBLIC_BACKEND_API_URL =", backendApiUrlFromConstants);
  // Keep the process.env log for comparison if needed, but prioritize Constants for actual use
  console.log("[AuthContext] DEBUG from process.env: EXPO_PUBLIC_BACKEND_API_URL =", process.env.EXPO_PUBLIC_BACKEND_API_URL);

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [isAwaitingEmailConfirmation, setIsAwaitingEmailConfirmation] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  const clearAuthError = () => {
    setAuthError(null);
  };

  // The temporary simplified useEffect should be removed or fully commented out.
  /*
  useEffect(() => {
    console.log('[AuthContext] Simplified useEffect running. Setting isLoading to false in 2s.');
    const timer = setTimeout(() => {
      console.log('[AuthContext] Simplified useEffect - Timer elapsed. Setting isLoading to false.');
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  */

  // Restore the original useEffect
  useEffect(() => {
    // Check onboarding status on initial load
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('@hasCompletedOnboarding');
        setHasCompletedOnboarding(value === 'true');
      } catch (e) {
        setHasCompletedOnboarding(false); // Default to showing onboarding on error
      }
    };
    checkOnboardingStatus();
    
    console.log('[AuthContext] useEffect init. Initial isLoading state:', isLoading);
    console.log('[AuthContext] Setting up onAuthStateChange listener...');
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`[AuthContext] onAuthStateChange event: ${event}`);
      console.log('[AuthContext] onAuthStateChange - currentSession user:', currentSession ? currentSession.user?.id || 'User object exists' : 'No session');
      
      const oldUser = user; 
      setSession(currentSession);
      const currentUser = currentSession ? currentSession.user : null;
      setUser(currentUser);

      if (currentUser) {
        setIsAwaitingEmailConfirmation(false);
        if ((!oldUser || oldUser.id !== currentUser.id || !profile || profile.user_id !== currentUser.id)) {
          console.log('[AuthContext] New session or user change, fetching profile for user:', currentUser.id);
          setIsLoading(true); 
          try {
            const fetchedProfile = await getUserProfile(currentUser.id);
            console.log('[AuthContext] Fetched profile:', fetchedProfile ? fetchedProfile.user_id : 'null');
            setProfile(fetchedProfile);
            if (event !== 'USER_UPDATED') { 
              setAuthError(null);
            }
          } catch (error) {
            console.error('[AuthContext] Error fetching profile:', error);
            setProfile(null); 
            setAuthError(error instanceof Error ? error : new Error('Failed to fetch profile'));
          } finally {
            console.log('[AuthContext] Profile fetch attempt complete, setting isLoading to false.');
            setIsLoading(false); 
          }
        } else {
          console.log('[AuthContext] Session active, profile already loaded and current for user:', currentUser.id);
          if (isLoading) setIsLoading(false);
        }
      } else { 
        console.log('[AuthContext] No session from onAuthStateChange, clearing profile.');
        setProfile(null);
        console.log('[AuthContext] No session, setting isLoading to false.');
        setIsLoading(false); 
      }
    });

    console.log('[AuthContext] Checking initial Supabase session (supabase.auth.getSession())...');
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('[AuthContext] getSession() response - initialSession user:', initialSession ? initialSession.user?.id || 'User object exists' : 'No initial session');
      
      if (!initialSession && isLoading) { 
        console.log('[AuthContext] getSession() - No initial session, and still loading. Setting isLoading to false.');
        setIsLoading(false);
        setAuthError(null); 
      }
    }).catch(error => {
      console.error('[AuthContext] Error getting initial session:', error);
      console.log('[AuthContext] getSession() catch - Setting isLoading to false due to error.');
      if (isLoading) setIsLoading(false); 
      setAuthError(error instanceof Error ? error : new Error('Failed to get initial session'));
    });

    return () => {
      console.log('[AuthContext] Cleaning up onAuthStateChange listener.');
      authListener?.subscription.unsubscribe();
    };
  }, []); // Original empty dependency array

  const refreshUserProfile = async () => {
    if (!user) {
      console.log('[AuthContext] refreshUserProfile called but no user session found.');
      setProfile(null); 
      return;
    }
    console.log('[AuthContext] refreshUserProfile called for user:', user.id);
    try {
      const fetchedProfile = await getUserProfile(user.id);
      console.log('[AuthContext] Profile refreshed:', fetchedProfile ? fetchedProfile.user_id : 'null');
      setProfile(fetchedProfile);
      setAuthError(null);
    } catch (error) {
      console.error('[AuthContext] Error refreshing profile:', error);
      setAuthError(error instanceof Error ? error : new Error('Failed to refresh profile'));
    }
  };

  const manuallySetProfile = (newProfile: Profile | null) => {
    console.log('[AuthContext] manuallySetProfile called with:', newProfile ? newProfile.user_id : 'null');
    setProfile(newProfile);
  };

  const createProfile = async ({
    userId,
    updates,
  }: {
    userId: string;
    updates: Partial<Profile>;
  }): Promise<boolean> => {
    setIsSaving(true);
    try {
      console.log(`[AuthContext] Upserting profile for user ${userId}...`);
      
      const profileData = {
        user_id: userId,
        ...updates,
      };

      const { error } = await supabase.from('profiles').upsert(profileData);

      if (error) {
        console.error("Error creating profile:", error);
        throw error;
      }
      
      console.log("[AuthContext] Profile upserted successfully.");
      await refreshUserProfile(); // Refresh data from DB to get the latest state
      return true;
    } catch (error) {
      console.error("Error in createProfile function:", error);
      setAuthError(error instanceof Error ? error : new Error('An unknown error occurred.'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = async ({
    updates,
  }: {
    updates: Partial<Profile>;
  }): Promise<boolean> => {
    setIsSaving(true);
    try {
       if (!user) {
        throw new Error('No user session available.');
      }
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      if (data) {
        console.log("[AuthContext] Profile updated successfully:", data);
        setProfile(data as Profile);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error in updateProfile function:", error);
      setAuthError(error instanceof Error ? error : new Error('An unknown error occurred during profile update.'));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const signOut = async () => {
    console.log("[AuthContext] Signing out...");
    // console.log('[AuthContext] signOut called. Setting isLoading to true.');
    // setIsLoading(true); 

    // Only show loading indicator if signout takes longer than 300ms
    let loadingTimerId: number | null = setTimeout(() => {
      console.log('[AuthContext] signOut is taking a while, setting isLoading to true.');
      setIsLoading(true);
      loadingTimerId = null; // Clear the timer ID once it has run
    }, 300);

    try {
      await supabase.auth.signOut();
      console.log('[AuthContext] Supabase signOut successful.');
      setAuthError(null); 
      setIsAwaitingEmailConfirmation(false); // Reset this on any sign out
    } catch (error) {
      console.error('[AuthContext] Error during signOut:', error);
      // console.log('[AuthContext] signOut catch - Setting isLoading to false due to error.');
      // setIsLoading(false); // isLoading is managed by onAuthStateChange or the timer now for errors too
      setAuthError(error instanceof Error ? error : new Error('Failed to sign out'));
    } finally {
      if (loadingTimerId) { // If the timer hasn't run yet (signout was fast)
        console.log('[AuthContext] signOut completed quickly, clearing loading timer.');
        clearTimeout(loadingTimerId);
      } else {
        // If timer did run and set isLoading to true, onAuthStateChange will set it to false.
        // If there was an error AND timer ran, we might need to ensure isLoading becomes false.
        // However, onAuthStateChange should still fire with no session, or we might be stuck loading.
        // For simplicity, relying on onAuthStateChange for success path.
        // If error occurred *after* timer, isLoading might be true. Consider if onAuthStateChange handles this.
        // Current onAuthStateChange sets isLoading to false if no session.
      }
       // isLoading will be set to false by the onAuthStateChange listener when it processes SIGNED_OUT
       // or if an error occurred AND the timer didn't run to set it true, it remains false.
    }
  };

  const signInWithGoogle = async () => {
    console.log('[AuthContext] signInWithGoogle called.');
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true, // We will handle the redirect manually with WebBrowser
        },
      });

      if (error) {
        console.error('[AuthContext] Supabase OAuth error:', error.message);
        throw error;
      }
      
      if (data.url) {
        console.log('[AuthContext] Opening WebBrowser for Google OAuth at:', data.url);
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

        if (result.type === 'success') {
          console.log('[AuthContext] WebBrowser OAuth flow successful.');
          // The onAuthStateChange listener will handle setting the session and user.
        } else if (result.type === 'cancel' || result.type === 'dismiss') {
          console.log('[AuthContext] WebBrowser OAuth flow was cancelled or dismissed by the user.');
          // Optional: handle user cancellation explicitly if needed
        } else {
          console.warn('[AuthContext] WebBrowser OAuth flow returned an unexpected result type:', result.type);
        }
      } else {
          throw new Error("No URL returned from Supabase for OAuth");
      }

    } catch (error) {
      console.error('[AuthContext] signInWithGoogle error:', error);
      setAuthError(error instanceof Error ? error : new Error('An unknown error occurred during Google sign-in.'));
    } finally {
      // onAuthStateChange will set isLoading to false on success.
      // If there's an error, we need to ensure it's set to false here.
      setIsLoading(false);
    }
  };

  const signInWithPassword = async (credentials: SignInWithPasswordCredentials): Promise<{ user: User | null; error: Error | null }> => {
    console.log('[AuthContext] signInWithPassword called. Setting isLoading to true.');
    setIsLoading(true);
    setAuthError(null);
    setIsAwaitingEmailConfirmation(false); // Reset this on login attempt
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error) {
        console.error('[AuthContext] Supabase signIn error:', error);
        setAuthError(error);
        setIsLoading(false); 
        return { user: null, error };
      }
      console.log('[AuthContext] Supabase signIn successful for user:', data.user?.id);
      // onAuthStateChange will handle setting user, session, profile, and isLoading to false.
      return { user: data.user, error: null };
    } catch (error) {
      console.error('[AuthContext] Catch-all error in signInWithPassword:', error);
      const typedError = error instanceof Error ? error : new Error('An unexpected error occurred during sign in.');
      setAuthError(typedError);
      setIsLoading(false); 
      return { user: null, error: typedError };
    }
  };

  const signUpWithEmail = async (credentials: SignUpWithPasswordCredentials): Promise<{ user: User | null; error: Error | null }> => {
    console.log('[AuthContext] signUpWithEmail called. Setting isLoading to true.');
    setIsLoading(true);
    setAuthError(null);
    setIsAwaitingEmailConfirmation(false); 
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp(credentials);

      if (signUpError) {
        console.error('[AuthContext] Supabase signUp error:', signUpError);
        setAuthError(signUpError);
        setIsLoading(false);
        return { user: null, error: signUpError };
      }

      if (signUpData.user) {
        if (signUpData.user.identities && signUpData.user.identities.length === 0 && !signUpData.user.email_confirmed_at) {
          console.warn('[AuthContext] User with this email may already exist or needs confirmation.');
          const alreadyExistsError = new Error("An account with this email address already exists. Please try logging in, or check your email to confirm your existing account.");
          setAuthError(alreadyExistsError);
          setIsLoading(false);
          return { user: null, error: alreadyExistsError };
        }
        
        console.log('[AuthContext] Supabase signUp successful for user (pre-confirmation):', signUpData.user.id);
        setUser(signUpData.user); 

        if (signUpData.session) {
            setSession(signUpData.session);
            console.log('[AuthContext] signUpWithEmail - Session data present in signUpData for new user:', signUpData.session.user.id);
            setIsAwaitingEmailConfirmation(false); 
        } else {
            console.log('[AuthContext] signUpWithEmail - No session in signUpData for new user. User needs email confirmation.');
            setSession(null); 
            setIsAwaitingEmailConfirmation(true); 
            try {
                console.log('[AuthContext] signUpWithEmail - Attempting to fetch profile for unconfirmed user (best effort):', signUpData.user.id);
                const fetchedProfile = await getUserProfile(signUpData.user.id); 
                setProfile(fetchedProfile); 
                console.log('[AuthContext] signUpWithEmail - Profile fetched for unconfirmed user:', fetchedProfile ? fetchedProfile.user_id : 'null');
            } catch (profileError) {
                console.warn('[AuthContext] signUpWithEmail - Expected error fetching profile for unconfirmed user:', profileError);
                setProfile(null); 
            }
        }
        
        console.log('[AuthContext] signUpWithEmail - Setting isLoading to false after processing new user.');
        setIsLoading(false); 
        return { user: signUpData.user, error: null };
      }
      
      console.warn('[AuthContext] signUpWithEmail - No user data and no error from Supabase. Setting isLoading false.');
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

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@hasCompletedOnboarding', 'true');
      setHasCompletedOnboarding(true);
    } catch (e) {
      console.error('Failed to save onboarding status.', e);
      // Decide if you want to set an authError here
    }
  };

  console.log('[AuthContext] Rendering AuthProvider. isLoading:', isLoading, 'Session User:', session?.user?.id || 'null', 'AwaitingConfirm:', isAwaitingEmailConfirmation, 'CompletedOnboarding:', hasCompletedOnboarding);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        session,
        user,
        profile,
        authError,
        isAwaitingEmailConfirmation, 
        hasCompletedOnboarding,
        signInWithPassword,
        signInWithGoogle,
        signOut,
        clearAuthError,
        signUpWithEmail,
        refreshUserProfile,
        manuallySetProfile,
        updateProfile,
        createProfile,
        completeOnboarding,
        isSaving,
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