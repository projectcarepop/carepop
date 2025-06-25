"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export default function EmailVerifiedPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-10 space-y-6 bg-white rounded-lg shadow-md border border-gray-200 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-space-grotesk)' }}>
          Email Verification Successful
        </h1>
        <p className="text-muted-foreground">
          Your email has been successfully verified. You can now log in to your account.
        </p>
        <Button asChild className="w-full">
          <Link href="/sign-in">Go to Sign In</Link>
        </Button>
      </div>
    </div>
  );
} 