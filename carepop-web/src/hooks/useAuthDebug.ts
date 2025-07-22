'use client';

import { useAuth } from '@/lib/contexts/auth-context';
import { useEffect } from 'react';

/**
 * Debug hook to log auth state changes and help identify issues
 * Only logs in development mode
 */
export function useAuthDebug() {
  const { user, session, isLoading, isInitialized } = useAuth();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH_DEBUG] State change:', {
        hasUser: !!user,
        hasSession: !!session,
        isLoading,
        isInitialized,
        userId: user?.id,
        userEmail: user?.email,
        sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
      });
    }
  }, [user, session, isLoading, isInitialized]);

  return { user, session, isLoading, isInitialized };
} 