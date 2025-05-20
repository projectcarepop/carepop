'use client';

import { useState } from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/navigation'; // Removed unused import
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Mail, Lock } from 'lucide-react'; // Icons
import GoogleIcon from '@/components/ui/GoogleIcon'; // Added GoogleIcon import

export default function RegisterPage() {
  // const router = useRouter(); // Removed unused constant
  const { signUpWithPassword, isLoading, error, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setModalMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const { user, error: signUpError } = await signUpWithPassword(email, password);

    if (signUpError) {
      console.error('Registration failed:', signUpError.message);
      setMessage(`Registration failed: ${signUpError.message}`);
    } else if (user) {
      setModalMessage('Registration successful! Please check your email to confirm your account and complete the process.');
      setShowSuccessModal(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setMessage('');
    }
  };

  const handleGoogleSignUp = async () => {
    setMessage('');
    setModalMessage('');
    // For Google Sign-Up, if email confirmation is required for OAuth users too,
    // Supabase will handle sending the email. The user flow will be similar.
    // We might want to show a generic processing or check email message here too,
    // but it's harder to coordinate with the redirect flow of OAuth.
    // For now, rely on AuthContext to eventually show errors if Google sign-in fails before redirect.
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
        // If signInWithGoogle itself returns an error (e.g. popup closed, network issue before redirect)
        setMessage(`Google sign-up failed: ${googleError.message}`);
    } else {
        // Potentially set a general message, though user is likely being redirected.
        // setMessage("Redirecting to Google for sign-up..."); 
        // It might be better to set a modal for Google sign-up as well, 
        // indicating to check email if that's the flow.
        // For now, if no immediate error, assume redirect or onAuthStateChange will handle.
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Enter your details to register.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  disabled={isLoading || showSuccessModal} // Disable while loading or modal is shown
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6} // Supabase default minimum
                  className="pl-10"
                  disabled={isLoading || showSuccessModal} // Disable while loading or modal is shown
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10"
                  disabled={isLoading || showSuccessModal} // Disable while loading or modal is shown
                />
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error.message}</p>}
            {message && <p className={`text-sm ${error || (password !== confirmPassword && message === 'Passwords do not match.') ? 'text-destructive' : 'text-primary'}`}>{message}</p>}
            <Button type="submit" className="w-full" disabled={isLoading || showSuccessModal}>
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isLoading || showSuccessModal}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            Sign up with Google
          </Button>
        </CardContent>
        <CardFooter className="text-sm">
          <p>
            Already have an account?{' '}
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link href="/login">Login here</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>

      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registration Submitted</AlertDialogTitle>
            <AlertDialogDescription>
              {modalMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessModal(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
} 