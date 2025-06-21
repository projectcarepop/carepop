"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";

export default function Page() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleOauthSignIn = async (provider: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (cause) {
      console.error(cause);
      const message = (cause as any).errors?.[0]?.message || "Something went wrong.";
      setError(message);
    }
  }

  const onSignInPress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        console.log(result);
      }
    } catch (err: any) {
      setError(err.errors[0]?.longMessage || "Something went wrong. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

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
        <form onSubmit={onSignInPress} className="space-y-4">
            <div>
            <Label htmlFor="email">Email address</Label>
            <Input
                value={emailAddress}
                type="email"
                id="email"
                placeholder="Enter your email address"
                onChange={(e) => setEmailAddress(e.target.value)}
                required
                className="mt-1"
            />
            </div>
            <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                    <Input
                        value={password}
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Enter your password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-1 right-1 h-7 w-7"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <Icons.eyeOff className="h-4 w-4" />
                        ) : (
                            <Icons.eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                        </span>
                    </Button>
                </div>
                 <div className="flex items-center justify-end mt-2">
                    <Link href="/forgot-password"
                        className="text-sm font-medium text-primary hover:text-primary/90 underline underline-offset-4"
                    >
                        Forgot password?
                    </Link>
                </div>
              </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
            </Button>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
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
        <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" onClick={() => handleOauthSignIn('oauth_apple')} disabled={isLoading}>
                <Icons.apple className="mr-2 h-4 w-4" /> Apple
            </Button>
            <Button variant="outline" type="button" onClick={() => handleOauthSignIn('oauth_google')} disabled={isLoading}>
                <Icons.google className="mr-2 h-4 w-4" /> Google
            </Button>
        </div>
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