"use client";

import * as React from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [successfulCreation, setSuccessfulCreation] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setSuccessfulCreation(true);
    } catch (err: any) {
      setError(err.errors[0].longMessage);
    } finally {
        setIsLoading(false);
    }
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      
      await setActive({ session: result.createdSessionId });
      router.push("/");

    } catch (err: any) {
        setError(err.errors[0].longMessage);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
                    Forgot Password
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                    Enter your email to reset your password.
                </p>
            </div>

            <form onSubmit={!successfulCreation ? create : reset} className="space-y-4">
            {!successfulCreation && (
                <>
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Reset Code"}
                    </Button>
                </>
            )}

            {successfulCreation && (
                <>
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="code">Verification Code</Label>
                        <Input
                            id="code"
                            placeholder="Enter the code from your email"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            type="password"
                            id="password"
                            placeholder="Enter your new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                </>
            )}
             {error && <p className="text-sm text-red-500 text-center mt-2">{error}</p>}
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
    </div>
  );
} 