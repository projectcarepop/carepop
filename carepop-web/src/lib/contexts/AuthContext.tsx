'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { User, AuthError, PostgrestError, Session, SupabaseClient } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

export interface Profile {
  user_id: string; // Matches Supabase auth.users.id
  username?: string; // Optional, standard field
  avatar_url?: string; // Optional, standard field
  role?: string; // <--- ADDED ROLE FIELD

  // Fields aligned with carepop-mobile/screens/CreateProfileScreen.tsx payload
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
  dateOfBirth?: string; // Expected as YYYY-MM-DD string
  age?: number; // Derived on mobile, optional here
  
  genderIdentity?: string;
  pronouns?: string; // This specific field is used on mobile
  assignedSexAtBirth?: string;
  
  civilStatus?: string;
  religion?: string;
  occupation?: string;
  
  street?: string;
  barangayCode?: string;
  cityMunicipalityCode?: string;
  provinceCode?: string;
  
  contactNo?: string;
  philhealthNo?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  error: AuthError | PostgrestError | Error | null;
  signInWithEmail: (email: string, password?: string) => Promise<{ error: AuthError | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  fetchProfile: (user: User, session: Session | null) => Promise<Profile | null>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | PostgrestError | Error | null>(null);

  // For debugging purposes: expose supabase client to window in dev mode
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    interface CustomWindow extends Window {
      supabase?: SupabaseClient;
    }
    (window as CustomWindow).supabase = supabase;
  }

  useEffect(() => {
    console.log('[AuthContext] Main useEffect triggered. Pathname:', pathname);

    console.log('[AuthContext] useEffect for session/profile triggered. Pathname:', pathname);
    const getInitialSessionAndProfile = async () => {
      console.log('[AuthContext] getInitialSessionAndProfile: START, setting isLoading=true');
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[AuthContext] getInitialSessionAndProfile: Got session', session ? '(exists)' : '(null)');
        setCurrentSession(session);
        setUser(session?.user ?? null);
        let currentProfile: Profile | null = null;
        if (session?.user) {
          console.log('[AuthContext] getInitialSessionAndProfile: Fetching profile for user:', session.user.id);
          currentProfile = await fetchProfile(session.user, session);
          console.log('[AuthContext] getInitialSessionAndProfile: Profile fetched (currentProfile var):', currentProfile ? JSON.stringify(currentProfile, null, 2) : 'NULL/Error');
          console.log('[AuthContext] getInitialSessionAndProfile: Context state profile BEFORE redirect check:', profile ? JSON.stringify(profile, null, 2) : 'NULL STATE');
        }
        
        if (session?.user && (!currentProfile || !currentProfile.firstName)) {
          console.log(`[AuthContext] getInitialSessionAndProfile: Redirect check. currentProfile.firstName: ${currentProfile?.firstName}, Context profile.firstName: ${profile?.firstName}`);
          if (pathname !== '/create-profile' && pathname !== '/auth/callback') {
            console.log('[AuthContext] Initial load: User logged in, profile incomplete. Redirecting to /create-profile.');
            router.push('/create-profile');
          }
        }
      } catch (e) {
        console.error('[AuthContext] getInitialSessionAndProfile: CRITICAL ERROR', e);
        const typedError = e instanceof Error ? e : new Error('Failed to initialize session or profile');
        setError(typedError);
      } finally {
        console.log('[AuthContext] getInitialSessionAndProfile: FINALLY, setting isLoading=false');
        setIsLoading(false);
      }
    };

    getInitialSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log(`[AuthContext] onAuthStateChange: EVENT: ${_event}, setting isLoading=true. Session:`, session ? '(exists)' : '(null)');
      setIsLoading(true);
      const previousUser = user; // Capture the entire previous user state

      try {
        const currentUser = session?.user ?? null;
        setUser(currentUser); 
        setCurrentSession(session);
        console.log('[AuthContext] onAuthStateChange: User set to:', currentUser ? currentUser.id : 'null');
        
        let currentProfile: Profile | null = null; // Keep this for profile fetching

        // More specific check for email confirmation event
        if (currentUser && 
            (_event === 'USER_UPDATED' || _event === 'SIGNED_IN') && // Could happen on SIGNED_IN after verify link too
            currentUser.email_confirmed_at && 
            !previousUser?.email_confirmed_at && // Check if previous state was not confirmed
            previousUser?.id === currentUser.id // Ensure it's the same user being updated
        ) {
          console.log('[AuthContext] onAuthStateChange: Email confirmation transition detected. Signing out and redirecting to login for re-authentication.');
          await supabase.auth.signOut();
          setUser(null);
          setCurrentSession(null);
          setProfile(null); // Clear profile as well
          router.push('/login?status=email_verification_success'); 
          setIsLoading(false);
          return;
        }

        // Existing profile fetching logic
        if (currentUser) {
          console.log('[AuthContext] onAuthStateChange: Fetching profile for user:', currentUser.id);
          currentProfile = await fetchProfile(currentUser, session);
          console.log('[AuthContext] onAuthStateChange: Profile fetched after fetchProfile call:', currentProfile ? JSON.stringify(currentProfile, null, 2) : 'NULL');
        } else {
          setProfile(null);
          console.log('[AuthContext] onAuthStateChange: No current user, profile set to null');
        }

        if (currentUser && (_event === 'SIGNED_IN' || _event === 'USER_UPDATED')) {
          console.log('[AuthContext] onAuthStateChange: SIGNED_IN or USER_UPDATED event (standard handling).');
          console.log('[AuthContext] onAuthStateChange: currentProfile before redirect check:', JSON.stringify(currentProfile, null, 2));
          console.log(`[AuthContext] onAuthStateChange: currentProfile.firstName value: ${currentProfile?.firstName}`);

          if ((!currentProfile || !currentProfile.firstName)) {
            if (pathname !== '/create-profile' && pathname !== '/auth/callback') {
              console.log('[AuthContext] onAuthStateChange: User signed in/updated, profile incomplete. Redirecting to /create-profile.');
              router.push('/create-profile');
            }
          } else if (currentProfile?.firstName && (pathname === '/login' || pathname === '/register' || pathname === '/auth/callback')) {
            console.log(`[AuthContext] onAuthStateChange: User signed in, profile complete, on ${pathname}. Redirecting to /dashboard.`);
            router.push('/dashboard');
          }
        }
      } catch (e) {
        console.error('[AuthContext] onAuthStateChange: CRITICAL ERROR', e);
        const typedError = e instanceof Error ? e : new Error('Failed during auth state change processing');
        setError(typedError);
      } finally {
        console.log(`[AuthContext] onAuthStateChange: FINALLY for event ${_event}, setting isLoading=false`);
        setIsLoading(false); 
      }
    });

    return () => {
      console.log('[AuthContext] useEffect cleanup: Unsubscribing auth listener.');
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);

  const fetchProfile = async (userParam: User, sessionParam: Session | null): Promise<Profile | null> => {
    if (!userParam || !sessionParam?.access_token) {
      console.log('[AuthContext] fetchProfile: Called with no user or no access token, setting profile to null.');
      setProfile(null);
      return null;
    }
    console.log('[AuthContext] fetchProfile: Fetching from backend API for user:', userParam.id);
    
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    console.log('[AuthContext] fetchProfile: Using API URL:', apiUrl);
    if (!apiUrl) {
      console.error("[AuthContext] fetchProfile: Backend API URL is not configured.");
      setError(new Error("Application configuration error: Backend URL missing."));
      setProfile(null);
      return null;
    }

    try {
      const token = sessionParam.access_token;
      const response = await fetch(`${apiUrl}/api/v1/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error(`[AuthContext] fetchProfile: API error fetching profile for ${userParam.id}. Status: ${response.status}`, errorData);
        setError(new Error(errorData.message || `API Error: ${response.status}`));
        setProfile(null);
        return null;
      }

      const responseData = await response.json();
      
      const rawProfileData = responseData.data || responseData;

      if (!rawProfileData || Object.keys(rawProfileData).length === 0) { 
        console.error(`[AuthContext] fetchProfile: Profile data is empty or not found in API response for ${userParam.id}. Response:`, responseData);
        setProfile(null);
        return null;
      }

      // Map snake_case to camelCase
      const fetchedProfileData: Profile = {
        user_id: rawProfileData.user_id,
        username: rawProfileData.username,
        avatar_url: rawProfileData.avatar_url,
        role: rawProfileData.role,
        firstName: rawProfileData.first_name,
        middleInitial: rawProfileData.middle_initial,
        lastName: rawProfileData.last_name,
        dateOfBirth: rawProfileData.date_of_birth,
        age: rawProfileData.age,
        genderIdentity: rawProfileData.gender_identity,
        pronouns: rawProfileData.pronouns,
        assignedSexAtBirth: rawProfileData.assigned_sex_at_birth,
        civilStatus: rawProfileData.civil_status,
        religion: rawProfileData.religion,
        occupation: rawProfileData.occupation,
        street: rawProfileData.street,
        barangayCode: rawProfileData.barangay_code,
        cityMunicipalityCode: rawProfileData.city_municipality_code,
        provinceCode: rawProfileData.province_code,
        contactNo: rawProfileData.contact_no,
        philhealthNo: rawProfileData.philhealth_no,
        // Ensure all fields from the Profile interface are mapped here
      };

      console.log('[AuthContext] fetchProfile: Mapped fetchedProfileData (camelCase) before setting state:', JSON.stringify(fetchedProfileData, null, 2));
      console.log(`[AuthContext] fetchProfile: Does MAPPED fetchedProfileData have firstName? ${fetchedProfileData && fetchedProfileData.hasOwnProperty('firstName') ? fetchedProfileData.firstName : 'No or undefined'}`);

      console.log(`[AuthContext] fetchProfile: Successfully fetched profile data from API for ${userParam.id}`);
      setProfile(fetchedProfileData);
      setError(null);
      console.log('[AuthContext] fetchProfile: Profile state updated successfully with:', JSON.stringify(fetchedProfileData, null, 2));
      return fetchedProfileData;

    } catch (e: unknown) {
      console.error(`[AuthContext] fetchProfile: Unexpected error during API call for user ${userParam.id}:`, e);
      const typedError = e instanceof Error ? e : new Error('Failed to fetch profile from API.');
      setError(typedError);
      setProfile(null);
      return null;
    }
  };

  const exposedFetchProfile = async (userForProfile: User): Promise<Profile | null> => {
    const { data } = await supabase.auth.getSession();
    return await fetchProfile(userForProfile, data.session);
  };

  const signInWithEmail = async (email: string, password?: string) => {
    if (!password) {
      // Handle passwordless (magic link) if needed, or throw error
      throw new Error("Password is required for email sign-in.");
    }
    
    setIsLoading(true);
    setError(null);
    
    // Use the client-side Supabase SDK directly
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[AuthContext] signInWithEmail: Supabase auth error:', error);
      setError(error);
    }
    // No need to manually set user/session, onAuthStateChange will handle it.
    
    setIsLoading(false);
    return { error };
  };

  const signUpWithPassword = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    let userToReturn = null;
    let errorToReturn = null;
    try {
      const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });
      if (signUpError) {
        setError(signUpError);
        errorToReturn = signUpError;
      } else {
        userToReturn = newUser;
      }
    } catch (catchError: unknown) {
      console.error('Caught an unexpected error during signUpWithPassword:', catchError);
      const typedError = catchError instanceof AuthError ? catchError : (catchError instanceof Error ? catchError : new Error('Unexpected error during sign up'));
      setError(typedError);
      errorToReturn = typedError instanceof AuthError ? typedError : { name: 'SignUpCatchError', message: typedError.message } as AuthError;
    } finally {
      setIsLoading(false);
    }
    return { user: userToReturn, error: errorToReturn };
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });
      if (googleError) {
        console.error('Google Sign-In error:', googleError);
        setError(googleError);
      }
      if (googleError) setIsLoading(false); 
      return { error: googleError };
    } catch (catchError: unknown) {
        console.error('Caught an unexpected error during signInWithGoogle:', catchError);
        const typedError = catchError instanceof AuthError ? catchError : (catchError instanceof Error ? catchError : new Error('Unexpected error during Google sign in'));
        setError(typedError);
        setIsLoading(false);
        return { error: typedError instanceof AuthError ? typedError : { name: 'GoogleSignInCatchError', message: typedError.message } as AuthError };
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    setIsLoading(true);
    setError(null);
    console.log(`[AuthContext] sendPasswordResetEmail: Attempting to send reset email to: ${email}`);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (resetError) {
        console.error('Password Reset error:', resetError);
        setError(resetError);
      }
      return { error: resetError };
    } catch (catchError: unknown) {
      console.error('Caught an unexpected error during sendPasswordResetEmail:', catchError);
      const typedError = catchError instanceof AuthError ? catchError : (catchError instanceof Error ? catchError : new Error('Unexpected error during password reset email'));
      setError(typedError);
      return { error: typedError instanceof AuthError ? typedError : { name: 'PasswordResetCatchError', message: typedError.message } as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError(signOutError);
      } else {
        setProfile(null);
      }
      return { error: signOutError };
    } catch (catchError: unknown) {
      console.error('Caught an unexpected error during signOut:', catchError);
      const typedError = catchError instanceof AuthError ? catchError : (catchError instanceof Error ? catchError : new Error('Unexpected error during sign out'));
      setError(typedError);
      return { error: typedError instanceof AuthError ? typedError : { name: 'SignOutCatchError', message: typedError.message } as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session: currentSession,
      profile,
      isLoading,
      error,
      signInWithEmail,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
      fetchProfile: exposedFetchProfile,
      sendPasswordResetEmail
    }}>
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