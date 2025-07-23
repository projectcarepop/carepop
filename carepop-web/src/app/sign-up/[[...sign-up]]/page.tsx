"use client";

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/contexts/auth-context'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/icons'
import { GoogleIcon } from '@/components/icons/GoogleIcon'
import { useToast } from '@/hooks/use-toast'
import { MailCheck } from 'lucide-react'
import { signUpWithEmail } from '../actions'

export default function SignUpPage() {
  const { supabase } = useAuth();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  
  // Check for success or error messages from server action
  const message = searchParams.get('message');
  const success = searchParams.get('success');
  const isSuccess = success === 'true';

  async function handleOAuthSignUp(provider: 'google') {
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      });
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: error.message,
      });
    }
  }


  if (isSuccess) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="w-full max-w-md p-10 space-y-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
            <MailCheck className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Confirm your email</h1>
            <p className="text-muted-foreground">
              We&apos;ve sent a confirmation link to your email address. Please check your inbox and click the link to complete the sign-up process.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                  <Link href="/sign-in">Back to Sign In</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Not receiving emails? 
                <Link href="/auth/email-debug" className="text-primary hover:underline ml-1">
                  Check troubleshooting guide
                </Link>
              </p>
            </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 my-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome! Please fill in the details to get started.
          </p>
        </div>
        {/* Email/Password Form using Server Action */}
        <form action={signUpWithEmail} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email address</label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="Enter your email address" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Icons.eyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Icons.eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          {message && (
            <p className="text-sm font-medium text-destructive">{message}</p>
          )}
          <Button type="submit" className="w-full">
            Create account
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              OR CONTINUE WITH
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
            <Button variant="outline" type="button" onClick={() => handleOAuthSignUp('google')}>
                <GoogleIcon className="mr-2 h-4 w-4" /> Google
            </Button>
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/sign-in"
            className="underline underline-offset-4 text-primary hover:text-primary/90"
          >
            Login
          </Link>
        </p>
        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{' '}
          <Link
            href="/terms-of-service"
            className="underline underline-offset-4 text-primary hover:text-primary/90"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy-policy"
            className="underline underline-offset-4 text-primary hover:text-primary/90"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
} 