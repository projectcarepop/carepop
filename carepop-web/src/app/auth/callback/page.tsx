'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/contexts/AuthContext';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGoogle, user, isLoading } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('OAuth Error:', error);
      router.push('/login?error=oauth_failed');
      return;
    }

    if (code) {
      loginWithGoogle(code)
        .then(() => {
          // The login function from the context will set the user state.
          // We can then use another useEffect to react to the user state change.
        })
        .catch(err => {
          console.error('Failed to exchange code for session:', err);
          router.push('/login?error=token_exchange_failed');
        });
    }
  }, [searchParams, router, loginWithGoogle]);

  useEffect(() => {
    if (!isLoading && user) {
      // User is authenticated, check if their profile is complete
      if (user.first_name && user.last_name) {
        console.log('Auth Callback: Profile complete, redirecting to /dashboard');
        router.push('/dashboard');
      } else {
        console.log('Auth Callback: Profile incomplete, redirecting to /create-profile');
        router.push('/create-profile');
      }
    }
  }, [user, isLoading, router]);

  return <div>Processing authentication...</div>;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading authentication...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
} 