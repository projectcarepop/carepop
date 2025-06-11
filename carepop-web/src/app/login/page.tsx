'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import GoogleIcon from '../../components/ui/GoogleIcon';
import { useSearchParams, useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

export default function LoginPage() {
  const { login, loginWithGoogle, isLoading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // If the user is already logged in, redirect them to the dashboard.
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  useEffect(() => {
    const status = searchParams.get('status');
    const err = searchParams.get('error');
    if (status === 'email_verification_success') {
      setMessage('Email successfully verified! You can now log in.');
    } else if (status === 'password_reset_success') {
      setMessage('Password successfully reset! You can now log in with your new password.');
    } else if (err) {
      setError('An error occurred during authentication. Please try again.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await login({ email, password });
      // The useEffect hook above will handle the redirect on successful login.
    } catch (err) {
      console.error('Login failed:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'Login failed. Please check your credentials.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during login.');
      }
    }
  };
  
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
        loginWithGoogle(codeResponse.code).catch(err => {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Google login failed.');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred during Google login.');
            }
        });
    },
    flow: 'auth-code', // Important to get the authorization code
  });

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back!</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'} // Toggle input type
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10" // Added pr-10 for icon space
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-end text-sm">
              <Button variant="link" className="p-0 h-auto font-normal" asChild>
                <Link href="/forgot-password">Forgot Password?</Link>
              </Button>
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            {message && <p className="text-sm text-primary text-center">{message}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => handleGoogleLogin()} disabled={isLoading}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm">
          <p>
            Don&apos;t have an account?{' '}
            <Button variant="link" className="p-0 h-auto" asChild>
                <Link href="/register">Register here</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 