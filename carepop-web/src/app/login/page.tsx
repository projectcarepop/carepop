'use client';

import { useState } from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/navigation'; // Removed unused import
import { useAuth } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'; // Added Eye, EyeOff icons
import GoogleIcon from '@/components/ui/GoogleIcon'; // Added GoogleIcon import

export default function LoginPage() {
  // const router = useRouter(); // Removed unused variable
  const { signInWithEmail, isLoading, error, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    // Adapt this to the correct AuthContext method for email/password
    const { error: signInError } = await signInWithEmail(email, password); 
    if (signInError) {
      console.error('Login failed:', signInError.message);
      // Error is set in AuthContext, also setting local message for more specific feedback if needed
      setMessage(`Login failed: ${signInError.message}`); 
    } else {
      setMessage('Login successful! Redirecting...');
      // router.push('/dashboard'); // Redirect handled by AuthContext or useEffect watching user state
    }
  };

  // Redirect if user is already logged in
  // React recommends handling side effects like navigation in useEffect
  // This will be handled by the main layout or a wrapper based on AuthContext user state.

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"> {/* Adjust min-height as needed based on header/footer */} 
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
            {error && <p className="text-sm text-destructive text-center">{error.message}</p>}
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
          <Button variant="outline" className="w-full" onClick={async () => {
            //setMessage('Redirecting to Google...'); // Optional: set a message
            await signInWithGoogle();
            // Error handling will be managed by AuthContext or page might navigate away
          }} disabled={isLoading}>
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