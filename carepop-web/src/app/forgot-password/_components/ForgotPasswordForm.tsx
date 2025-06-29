'use client';

import Link from 'next/link'
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { requestPasswordReset } from '../actions';
import { MailCheck } from 'lucide-react';

export function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const isSuccess = message === 'Password reset link has been sent to your email.';

  if (isSuccess) {
    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
            <MailCheck className="mx-auto h-12 w-12 text-primary" />
            <h1 className="text-2xl font-bold">Check your email</h1>
            <p className="text-muted-foreground">
              {message}
            </p>
            <Button asChild>
                <Link href="/sign-in">Back to Sign In</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="w-full max-w-md p-8 my-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
    <div className="text-center">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Forgot Password
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>
    </div>
    <form action={requestPasswordReset} className="space-y-4">
        <div>
            <label className="text-sm font-medium" htmlFor="email">Email address</label>
            <Input id="email" name="email" type="email" placeholder="Enter your email address" required />
        </div>
        {message && <p className="text-sm font-medium text-destructive">{message}</p>}
        <Button type="submit" className="w-full">
            Send Reset Link
        </Button>
    </form>
    <p className="px-8 text-center text-sm text-muted-foreground">
      <Link
        href="/sign-in"
        className="underline underline-offset-4 text-primary hover:text-primary/90"
      >
        Back to Sign In
      </Link>
    </p>
  </div>
  )
} 