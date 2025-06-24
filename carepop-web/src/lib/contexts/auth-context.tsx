'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Memoize the client so it's not recreated on every render
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // onAuthStateChange fires immediately with the initial session state.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
    // We only want this to run once on mount.
    // The pathname dependency is added to re-check auth state on navigation, 
    // which can be useful in some edge cases like token expiry.
  }, [supabase, pathname, router]);

  const value: AuthContextType = useMemo(() => ({
    session,
    user: session?.user ?? null,
    isLoading,
  }), [session, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 