'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderForm } from '../components/ProviderForm';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function AddProviderPage() {
  const router = useRouter();

  const handleSuccess = () => {
    console.log('Provider created successfully, redirecting...');
    // Optionally add a toast notification here
    router.refresh(); // Invalidate cache to ensure the new provider appears in the list
    router.push('/admin/providers');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/providers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Provider List
          </Link>
        </Button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Add New Provider</h1>
      </div>
      
      <ProviderForm onSubmitSuccess={handleSuccess} />

      {/* 
        TODO: Implementation details for ProviderForm:
        - Fields: First Name, Last Name, Email, Phone, Specialization, License, Credentials, Bio, Is Active
        - Validation using Zod
        - API call to POST /api/v1/admin/providers
        - Submission state and feedback (toasts)
      */}
    </div>
  );
} 