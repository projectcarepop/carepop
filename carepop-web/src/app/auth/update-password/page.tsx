'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { createSupabaseBrowserClient } from '@/lib/supabase/client'; // Import the client
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'; // Removed CardFooter
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function UpdatePasswordPage() {
  const { isLoading: authLoading, session } = useAuth(); // Removed user, authError
  const supabase = createSupabaseBrowserClient(); // Instantiate client
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTokenProcessed, setIsTokenProcessed] = useState(false);

  useEffect(() => {
    // Supabase handles session from URL fragment automatically on onAuthStateChange
    // We just need to wait for the session to be potentially established
    if (!authLoading && !isTokenProcessed) {
      setIsTokenProcessed(true); // Set this earlier to avoid re-entry if session changes quickly
      if (session && session.user) {
        console.log('[UpdatePasswordPage] useEffect: Session detected from URL, user is present. Ready for password update.', session);
        // User is now authenticated with the recovery token
      } else if (!session) {
        console.warn('[UpdatePasswordPage] useEffect: No session found after auth loading. Invalid or expired token, or not a recovery flow.');
        setError('Invalid or expired password reset link. Please request a new one or try logging in.');
        // Optionally redirect to forgot-password or login
        // router.push('/login'); 
      }
    }
  }, [authLoading, session, isTokenProcessed, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    console.log('[UpdatePasswordPage] handleSubmit: Starting password update process.');

    if (!supabase) {
        console.error("[UpdatePasswordPage] handleSubmit: Supabase client not available.");
        setError("Supabase client not available.");
        setIsLoading(false);
        return;
    }

    if (!session || !session.user) {
      console.error("[UpdatePasswordPage] handleSubmit: No active session or user. Cannot update password.");
      setError("No active session. Please ensure you have followed the reset link correctly.");
      setIsLoading(false);
      return;
    }

    try {
      console.log('[UpdatePasswordPage] handleSubmit: Attempting to call supabase.auth.updateUser for user:', session.user.id);
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      console.log('[UpdatePasswordPage] handleSubmit: supabase.auth.updateUser call completed.');

      if (updateError) {
        console.error('[UpdatePasswordPage] Error updating password:', updateError);
        setError(updateError.message || 'Failed to update password.');
      } else {
        setSuccess('Password updated successfully! You can now log in with your new password.');
        // Optionally sign the user out and redirect to login
        await supabase.auth.signOut();
        setTimeout(() => router.push('/login?status=password_reset_success'), 3000);
      }
    } catch (e) {
      console.error('[UpdatePasswordPage] Unexpected error updating password:', e);
      const typedError = e instanceof Error ? e : new Error('An unexpected error occurred.');
      setError(typedError.message);
    } finally {
      console.log('[UpdatePasswordPage] handleSubmit: FINALLY block, setting isLoading to false.');
      setIsLoading(false);
    }
  };
  
  if (authLoading && !isTokenProcessed) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg">Verifying reset link...</p>
        </div>
    );
  }

  // After token processing, if there's no session (e.g. bad token), 
  // it might be good to show an error and prevent password update form.
  // However, Supabase client handles the session from the hash.
  // If `session` is null here after `authLoading` is false and `isTokenProcessed` is true, something is wrong.

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
          <CardDescription className="text-center text-slate-600 dark:text-slate-400">
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTokenProcessed && !session && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 shrink-0" />
                <p className="text-sm">Invalid or expired password reset link. Please request a new one.</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading || !session}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading || !session}
              />
            </div>
            
            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm p-2 bg-red-100 dark:bg-red-900/20 rounded-md flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="text-green-600 dark:text-green-400 text-sm p-2 bg-green-100 dark:bg-green-900/20 rounded-md flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 shrink-0" /> {success}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading || !session || !!success}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Set New Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 