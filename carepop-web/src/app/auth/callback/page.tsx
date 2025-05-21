'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

function AuthCallbackContent() {
  const router = useRouter();
  const { user, profile, isLoading, error, signOut } = useAuth();
  const [isEmailVerification, setIsEmailVerification] = useState(false);
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !isEmailVerification) {
      const hash = window.location.hash;
      if (hash.includes("type=signup")) {
        console.log('Auth Callback: Detected email verification (type=signup).');
        setIsEmailVerification(true);
      } else if (hash.includes("type=email_change")) {
        console.log('Auth Callback: Detected email change confirmation.');
        setIsEmailVerification(true);
      }
    }
  }, [isEmailVerification]);

  useEffect(() => {
    if (handled) return;

    const currentUser = user;
    const currentIsLoading = isLoading;

    if (isEmailVerification && currentUser) {
      console.log('Auth Callback: Handling email verification. Signing out and redirecting to login.');
      setHandled(true);
      signOut().then(() => {
        router.push('/login?status=email_verification_success');
      });
      return;
    }

    if (!currentIsLoading) {
      setHandled(true);
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
  }, [user, profile, isLoading, error, router, signOut]);

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