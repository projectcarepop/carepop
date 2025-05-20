'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

function AuthCallbackContent() {
  const router = useRouter();
  const { user, profile, isLoading, error } = useAuth();

  useEffect(() => {
    const currentUser = user;
    const currentIsLoading = isLoading;

    if (!currentIsLoading) {
      if (error) {
        console.error('Auth Callback Error:', error);
        setTimeout(() => router.push('/login'), 3000);
      } else if (currentUser) {
        console.log('Auth Callback: User authenticated', currentUser);
        if (profile?.firstName) {
          console.log('Auth Callback: Profile complete, redirecting to /dashboard');
          router.push('/dashboard');
        } else {
          console.log('Auth Callback: Profile incomplete or not yet loaded, redirecting to /create-profile');
          router.push('/create-profile');
        }
      } else {
        console.warn('Auth Callback: No user, no error, not loading. Attempting redirect to login after delay.');
        setTimeout(() => {
          if (!currentUser && !currentIsLoading) {
             console.log('Auth Callback: Still no user after delay, redirecting to login.');
             router.push('/login');
          }
        }, 1500);
      }
    }
  }, [user, profile, isLoading, error, router]);

  if (isLoading) {
    return <div>Verifying your email and processing session... Please wait.</div>;
  }

  if (error) {
    return <div>Authentication error: {error.message}. You will be redirected to login.</div>;
  }

  return <div>Finalizing authentication...</div>;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading authentication callback...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
} 