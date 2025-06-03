'use client'; // This will likely need to be a client component if it uses hooks for data fetching or redirection on success

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderForm, ProviderFormValues } from '../../components/ProviderForm'; // Adjusted import path
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
// import { toast } from '@/components/ui/use-toast'; // Assuming toast setup

interface EditProviderPageProps {
  params: {
    providerId: string;
  };
}

// Mock fetch function - replace with actual API call
async function fetchProviderById(id: string): Promise<ProviderFormValues | null> {
  console.log(`Fetching provider with ID: ${id}`);
  // Replace with: const response = await fetch(`/api/v1/admin/providers/${id}`);
  // if (!response.ok) return null;
  // const data = await response.json();
  // return data.data; // Assuming API returns { data: ProviderDetails }
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  if (id === "error") return null; // Simulate not found
  return {
    id,
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    phoneNumber: "123-456-7890",
    specialization: "Pediatrics",
    licenseNumber: "LIC12345",
    credentials: "MD, FAAP",
    bio: "Experienced pediatrician with over 10 years of practice.",
    isActive: true,
  };
}

export default function EditProviderPage({ params }: EditProviderPageProps) {
  const { providerId } = params;
  const router = useRouter();
  const [initialData, setInitialData] = useState<ProviderFormValues | null | undefined>(undefined); // undefined for loading, null for not found
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (providerId) {
      setIsLoading(true);
      setError(null);
      fetchProviderById(providerId)
        .then(data => {
          if (data) {
            setInitialData(data);
          } else {
            setInitialData(null); // Mark as not found
            setError(`Provider with ID ${providerId} not found.`);
            // Optionally redirect or show a specific not found component
            // router.push('/admin/providers'); // Or a 404 page
          }
        })
        .catch(err => {
          console.error("Failed to fetch provider:", err);
          setError("Failed to load provider data.");
          setInitialData(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [providerId, router]);

  const handleSuccess = () => {
    console.log('Provider updated successfully, redirecting...');
    // toast({ title: "Provider Updated", description: "The provider details have been successfully updated." });
    router.push('/admin/providers');
  };

  if (isLoading || initialData === undefined) { // Show loading if fetching or initialData is not yet determined
    return <div className="container mx-auto py-10 text-center">Loading provider data...</div>; // Replace with a skeleton loader
  }

  if (error && !initialData) { // Show error if fetching failed and no data is available
    return <div className="container mx-auto py-10 text-center text-red-500">Error: {error}</div>;
  }
  
  if (!initialData) { // Should ideally be caught by error state, but as a fallback
     return <div className="container mx-auto py-10 text-center">Provider not found.</div>;
  }

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
        <h1 className="text-3xl font-bold">Edit Provider</h1>
        {initialData.firstName && <span className="text-xl text-muted-foreground">({initialData.firstName} {initialData.lastName})</span>}
      </div>
      
      <ProviderForm initialData={initialData} onSubmitSuccess={handleSuccess} />
    </div>
  );
} 