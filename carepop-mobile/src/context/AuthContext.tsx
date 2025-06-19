import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';

// Define the Profile type right here to avoid any import issues.
export type Profile = {
  id: string;
  updated_at: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  phone_number: string | null;
  pronouns: string | null;
  onboarding_completed: boolean;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isSaving: boolean;
  signOut: () => void;
  createProfile: (profileData: { userId: string; updates: Partial<Profile> }) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // supabase.auth.onAuthStateChange is called right away with the current session.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        // The first time this runs, the user is either logged in or not.
        // In either case, the initial auth check is done, so we can stop loading.
        setIsLoading(false);
      }
    );

    return () => {
      // Cleanup the listener
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // If the user is logged in, fetch their profile
    if (user && session) {
      const fetchProfile = async () => {
        try {
          const { data, error, status } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (error && status !== 406) {
            throw error;
          }
          if (data) {
            setProfile(data as Profile);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      };
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user, session]);

  const createProfile = async ({ userId, updates }: { userId: string; updates: Partial<Profile> }) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, user_id: userId, onboarding_completed: true })
        .eq('user_id', userId);

      if (error) throw error;
      
      // Refresh profile data
      const { data: updatedProfile } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
      if (updatedProfile) setProfile(updatedProfile);

      return true;
    } catch (error) {
      console.error("Error creating profile:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    isSaving,
    signOut,
    createProfile,
  };

  return (
    <AuthContext.Provider value={value}>
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