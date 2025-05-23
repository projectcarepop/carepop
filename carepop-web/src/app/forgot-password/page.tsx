'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { sendPasswordResetEmail, isLoading: authIsLoading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    if (!email) {
      setFormError('Please enter your email address.');
      setIsSubmitting(false);
      return;
    }

    const { error } = await sendPasswordResetEmail(email);

    if (error) {
      console.error("[ForgotPasswordPage] Error sending reset email:", error);
      setFormError(error.message || 'Failed to send password reset email. Please try again.');
    } else {
      setFormSuccess('If an account exists for this email, a password reset link has been sent.');
      setEmail(''); // Clear the input field on success
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
          <CardDescription className="text-center text-slate-600 dark:text-slate-400">
            Enter your email address below and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email-forgot">Email Address</Label>
              <Input 
                type="email" 
                id="email-forgot" 
                name="email" 
                autoComplete="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1" 
                disabled={isSubmitting || authIsLoading}
              />
            </div>

            {formError && (
              <div className="text-red-600 dark:text-red-400 text-sm p-2 bg-red-100 dark:bg-red-900/20 rounded-md flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 shrink-0" /> {formError}
              </div>
            )}
            {authError && (
              <div className="text-red-600 dark:text-red-400 text-sm p-2 bg-red-100 dark:bg-red-900/20 rounded-md flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 shrink-0" /> {authError.message}
              </div>
            )}
            {formSuccess && (
              <div className="text-green-600 dark:text-green-400 text-sm p-2 bg-green-100 dark:bg-green-900/20 rounded-md flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 shrink-0" /> {formSuccess}
              </div>
            )}
            
            <div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || authIsLoading || !!formSuccess}
              >
                {(isSubmitting || authIsLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Password Reset Link
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} CarePop. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ForgotPasswordPage; 