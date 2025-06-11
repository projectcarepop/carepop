'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Loader2, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

function UpdatePasswordContent() {
  const { resetPassword, isLoading } = useAuth();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // The token from Supabase comes in the URL hash/fragment
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.substring(1)); // remove '#'
    const accessToken = params.get('access_token');
    
    if (accessToken) {
      setToken(accessToken);
    } else {
      setError('Password reset token not found. Please use the link from your email.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
        setError('No reset token available. Please use the link from your email.');
        return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      await resetPassword({ token, password: newPassword });
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => router.push('/login?status=password_reset_success'), 3000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Failed to update password.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
          <CardDescription className="text-center">
            Please enter and confirm your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input id="newPassword" type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required disabled={isLoading || !!success} />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading || !!success}/>
            </div>
            
            {error && (
              <div className="text-destructive text-sm p-3 bg-destructive/10 rounded-md flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="text-primary text-sm p-3 bg-primary/10 rounded-md flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 shrink-0" /> {success}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading || !token || !!success}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Set New Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UpdatePasswordPage() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <UpdatePasswordContent />
      </Suspense>
    );
} 