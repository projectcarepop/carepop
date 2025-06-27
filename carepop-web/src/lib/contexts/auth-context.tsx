'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Session, SupabaseClient, User } from '@supabase/supabase-js';

// The new context type now explicitly includes the Supabase client
type AuthContextType = {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  isInitialized: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use createBrowserClient directly here.
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (error) {
        console.error("Error fetching initial session:", error);
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  // useMemo to prevent unnecessary re-renders
  const value = useMemo(() => ({
    supabase,
    session,
    user,
    isInitialized,
    isLoading
  }), [supabase, session, user, isInitialized, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSupabase() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within an AuthProvider');
  }
  return context;
} 