'use client';

import React, { useEffect } from 'react';
import { useActionState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { login, type LoginFormState } from '@/lib/actions/auth.actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// SubmitButton component to handle pending state
function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Logging in...' : 'Login'}
        </Button>
    );
}

export default function LoginClientPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const initialState: LoginFormState = { message: '', errors: {}, success: false };
  const [state, formAction] = useActionState(login, initialState);

  // Add this useEffect to handle the redirect
  useEffect(() => {
    if (state.success) {
      router.push('/dashboard');
    }
  }, [state.success, router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back!</CardTitle>
          <CardDescription className="text-center">Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="pl-10"
                  aria-describedby="email-error"
                />
              </div>
              {state.errors?.email && (
                <p id="email-error" className="text-sm text-destructive">
                  {state.errors.email.join(', ')}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  className="pl-10 pr-10"
                  aria-describedby="password-error"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
               {state.errors?.password && (
                <p id="password-error" className="text-sm text-destructive">
                  {state.errors.password.join(', ')}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end text-sm">
              <Button variant="link" className="p-0 h-auto font-normal" asChild>
                <Link href="/forgot-password">Forgot Password?</Link>
              </Button>
            </div>

            {state.errors?.server && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>
                        {state.errors.server.join(', ')}
                    </AlertDescription>
                </Alert>
            )}
           
            <SubmitButton />
          </form>
          {/* Google Login can be refactored similarly later */}
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
           <Button variant="outline" className="w-full" disabled>
             Sign in with Google (Coming Soon)
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