'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const AccessDenied = ({ pageName = 'this page' }: { pageName?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-200px)] text-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full dark:bg-gray-800">
        <h1 className="text-3xl font-bold text-red-600 dark:text-red-500 mb-2">Access Denied</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          You do not have the necessary permissions to view {pageName}. This area is restricted to administrators only.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          If you believe you should have access, please contact your system administrator.
        </p>
        <Button asChild>
          <Link href="/dashboard">Go to Your Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied; 