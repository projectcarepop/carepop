'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function EmailConfirmedPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Email Verified!</CardTitle>
          <CardDescription>
            Thank you for verifying your email address. You can now log in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {/* Optional: You can add more content here if needed */}
        </CardContent>
        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/login">Proceed to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}