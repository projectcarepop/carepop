'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from '@/lib/react-query/client'; // Import our singleton client
import React from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
} 