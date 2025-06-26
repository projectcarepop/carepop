"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { signIn, googleSignIn } from "@/app/sign-in/actions";

// Note: We are no longer using react-hook-form as Server Actions simplify form handling.

export default function Page() {
  const [showPassword, setShowPassword] = React.useState(false);
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message');

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-600">
                Sign in to continue to your account.
            </p>
        </div>
        {/* Email/Password Form */}
        <form action={signIn} className="space-y-4">
            <div className="space-y-2">
                <div>
                    <label className="text-sm font-medium" htmlFor="email">Email address</label>
                    <Input id="email" name="email" type="email" placeholder="Enter your email address" required />
                </div>
                <div> 
                    <div className="relative mt-1">
                    <label className="text-sm font-medium" htmlFor="password">Password</label>
                        <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" required />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute bottom-1 right-1 h-7 w-7"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <Icons.eyeOff className="h-4 w-4" /> : <Icons.eye className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
                <div className="flex items-end justify-end">
                        <Link href="/forgot-password"
                            className="text-sm font-medium text-primary hover:text-primary/90 underline underline-offset-4">
                            Forgot password?
                        </Link>
                    </div>
            </div>
            {errorMessage && (
              <p className="text-sm font-medium text-destructive text-center">{errorMessage}</p>
            )}
          <Button type="submit" className="w-full">
              Continue
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

        {/* Google Sign-in Form */}
        <form action={googleSignIn}>
            <Button variant="outline" type="submit" className="w-full">
                <GoogleIcon className="mr-2 h-4 w-4" /> Google
            </Button>
        </form>

        <p className="px-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
            href="/sign-up"
            className="underline underline-offset-4 text-primary hover:text-primary/90"
            >
            Sign up
            </Link>
        </p>
      </div>
    </div>
  );
} 