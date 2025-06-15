'use client';

import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmailConfirmedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Email Verified!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Thank you for verifying your email. You can now proceed to log in to your account.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link href="/login">Proceed to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 