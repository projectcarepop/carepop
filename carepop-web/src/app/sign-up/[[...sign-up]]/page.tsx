"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";

export default function Page() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleOauthSignUp = async (provider: 'oauth_google' | 'oauth_apple') => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (cause) {
      console.error(cause);
      // Handle error accordingly
    }
  }

  const onSignUpPress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);

    } catch (err: any) {
      setError(err.errors[0]?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyPress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      if (completeSignUp.status !== "complete") {
        console.log(JSON.stringify(completeSignUp, null, 2));
      }
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/");
      }
    } catch (err: any) {
      setError(err.errors[0]?.longMessage || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
        {!pendingVerification && (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                Create your account
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Welcome! Please fill in the details to get started.
              </p>
            </div>
            <form onSubmit={onSignUpPress} className="space-y-4">
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
              <div className="relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  value={password}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
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
                <Button variant="outline" type="button" onClick={() => handleOauthSignUp('oauth_apple')} disabled={isLoading}>
                    <Icons.apple className="mr-2 h-4 w-4" /> Apple
                </Button>
                <Button variant="outline" type="button" onClick={() => handleOauthSignUp('oauth_google')} disabled={isLoading}>
                    <Icons.google className="mr-2 h-4 w-4" /> Google
                </Button>
            </div>
             <p className="px-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="underline underline-offset-4 text-primary hover:text-primary/90"
              >
                Login
              </Link>
            </p>
          </>
        )}
        {pendingVerification && (
          <>
            <div className="text-center">
                <h1 className="text-2xl font-bold">Verify your email</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    A verification code has been sent to your email.
                </p>
            </div>
            <form onSubmit={onVerifyPress} className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  value={code}
                  id="code"
                  placeholder="Enter verification code"
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </form>
          </>
        )}
         <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <a
              href="/terms"
              className="underline underline-offset-4 text-primary hover:text-primary/90"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="underline underline-offset-4 text-primary hover:text-primary/90"
            >
              Privacy Policy
            </a>
            .
          </p>
      </div>
    </div>
  );
} 