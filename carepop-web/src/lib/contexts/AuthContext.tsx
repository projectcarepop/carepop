'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User, AuthError, PostgrestError } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

export interface Profile {
  user_id: string; // Matches Supabase auth.users.id
  username?: string; // Optional, standard field
  avatar_url?: string; // Optional, standard field

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
  profile: Profile | null;
  isLoading: boolean;
  error: AuthError | PostgrestError | Error | null;
  signInWithEmail: (email: string, password?: string) => Promise<{ error: AuthError | null }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  fetchProfile: (user: User) => Promise<Profile | null>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | PostgrestError | Error | null>(null);

  useEffect(() => {
    const getInitialSessionAndProfile = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      let currentProfile: Profile | null = null;
      if (session?.user) {
        currentProfile = await fetchProfile(session.user);
      }
      
      // Redirect logic after initial load
      if (session?.user && (!currentProfile || !currentProfile.firstName)) {
        if (pathname !== '/create-profile') {
          console.log('[AuthContext] Initial load: User logged in, profile incomplete. Redirecting to /create-profile.');
          router.push('/create-profile');
        }
      }
      setIsLoading(false);
    };

    getInitialSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      let currentProfile: Profile | null = null;
      if (currentUser) {
        currentProfile = await fetchProfile(currentUser);
      } else {
        setProfile(null);
      }

      // Redirect logic on auth state change
      if (currentUser && (_event === 'SIGNED_IN' || _event === 'USER_UPDATED')) {
        if ((!currentProfile || !currentProfile.firstName)) {
          if (pathname !== '/create-profile') {
            console.log('[AuthContext] Auth event: User signed in/updated, profile incomplete. Redirecting to /create-profile.');
            router.push('/create-profile');
          }
        } else if (currentProfile?.firstName && pathname === '/login') {
          console.log('[AuthContext] Auth event: User signed in, profile complete, on login page. Redirecting to /dashboard.');
          router.push('/dashboard');
        }
      }
      setIsLoading(false); 
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, router, pathname]);

  const fetchProfile = async (user: User): Promise<Profile | null> => {
    if (!user) {
      setProfile(null);
      return null;
    }
    try {
      const { data: supabaseData, error: profileError, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && status !== 406) {
        console.error('Error fetching profile. Status from response:', status, 'Raw profileError object:', profileError);
        console.error('profileError keys:', Object.keys(profileError));
        console.error('profileError message:', profileError.message);
        console.error('profileError details:', profileError.details);
        console.error('profileError hint:', profileError.hint);
        console.error('profileError code:', profileError.code);

        if (profileError.message) {
          setError(profileError);
        } else {
          setError(new Error(`Error fetching profile. Status: ${status}. Error: ${JSON.stringify(profileError)}`));
        }
        setProfile(null);
        return null;
      }

      if (supabaseData) {
        // Transform snake_case from Supabase to camelCase for the Profile interface
        const transformedProfile: Profile = {
          user_id: supabaseData.user_id,
          username: supabaseData.username,
          avatar_url: supabaseData.avatar_url,
          firstName: supabaseData.first_name,
          middleInitial: supabaseData.middle_initial,
          lastName: supabaseData.last_name,
          dateOfBirth: supabaseData.date_of_birth,
          age: supabaseData.age,
          genderIdentity: supabaseData.gender_identity,
          pronouns: supabaseData.pronouns,
          assignedSexAtBirth: supabaseData.assigned_sex_at_birth,
          civilStatus: supabaseData.civil_status,
          religion: supabaseData.religion,
          occupation: supabaseData.occupation,
          street: supabaseData.street,
          barangayCode: supabaseData.barangay_code,
          cityMunicipalityCode: supabaseData.city_municipality_code,
          provinceCode: supabaseData.province_code,
          contactNo: supabaseData.contact_no,
          philhealthNo: supabaseData.philhealth_no,
        };
        setProfile(transformedProfile);
        return transformedProfile;
      }
      setProfile(null);
      return null;
    } catch (e: unknown) {
      console.error('Unexpected error fetching profile:', e);
      if (e instanceof Error) {
        setError(new Error('Failed to fetch profile: ' + e.message));
      } else {
        setError(new Error('Failed to fetch profile due to an unknown error.'));
      }
      setProfile(null);
      return null;
    }
  };

  const signInWithEmail = async (email: string, password?: string) => {
    setIsLoading(true);
    setError(null);

    if (!password) {
      console.error("Password is required for email/password sign-in.");
      const err = { name: "AuthInvalidCredentialsError", message: "Password is required." } as AuthError;
      setError(err);
      setIsLoading(false);
      return { error: err };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Login error:', signInError);
      setError(signInError);
    }
    return { error: signInError };
  };

  const signUpWithPassword = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
      },
    });
    if (signUpError) setError(signUpError);
    return { user: newUser, error: signUpError };
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
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
    return { error: googleError };
  };

  const sendPasswordResetEmail = async (email: string) => {
    setIsLoading(true);
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/update-password`,
    });
    if (resetError) {
      console.error('Password Reset error:', resetError);
      setError(resetError);
    }
    setIsLoading(false);
    return { error: resetError };
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError);
    return { error: signOutError };
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, error, signInWithEmail, signUpWithPassword, signInWithGoogle, signOut, fetchProfile, sendPasswordResetEmail }}>
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