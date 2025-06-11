'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="bg-white p-10 rounded-lg shadow-xl max-w-lg w-full">
        <h1 className="text-4xl font-bold text-yellow-500 mb-3">Restricted Area</h1>
        <p className="text-lg text-gray-700 mb-4">
          This part of the application is restricted to Super Administrators only.
        </p>
        <p className="text-gray-600 mb-8">
          We appreciate your interest! However, you do not have the required permissions to view this content. If you believe this is an error, please reach out to the technical team. Your feedback and security are important to us.
        </p>
        <Button asChild>
          <Link href="/dashboard">Return to Your Dashboard</Link>
        </Button>
      </div>
    </div>
  );
} 