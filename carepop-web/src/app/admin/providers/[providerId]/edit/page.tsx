'use client'; // This will likely need to be a client component if it uses hooks for data fetching or redirection on success

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderForm, ProviderFormValues } from '../../components/ProviderForm'; // Adjusted import path
import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client'; // Ensure this is imported
// import { toast } from '@/components/ui/use-toast'; // Assuming toast setup

// Define the type for initialData, including the optional id
// This should match or be compatible with ProviderFormProps['initialData']
type InitialProviderData = Partial<ProviderFormValues> & { id?: string; isActive?: boolean };

// Updated fetch function to make a real API call
async function fetchProviderById(id: string, token: string): Promise<InitialProviderData | null> {
  console.log(`Fetching provider with ID: ${id} using token.`);
  const response = await fetch(`/api/v1/admin/providers/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      console.error(`Provider with ID ${id} not found.`);
      return null;
    }
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to fetch provider ${id}: ${errorData.message || response.statusText} (Status: ${response.status})`);
  }

  const result = await response.json();
  const providerData = result.data; // Assuming API returns { data: ProviderDetails }

  if (!providerData) {
    console.error(`No data found for provider with ID ${id} in API response.`);
    return null;
  }

  // Transform snake_case from backend to camelCase for frontend
  return {
    id: providerData.id,
    firstName: providerData.first_name,
    lastName: providerData.last_name,
    email: providerData.contact_email || providerData.email, // Prefer contact_email
    phoneNumber: providerData.phone_number,
    specialization: providerData.specialization,
    licenseNumber: providerData.license_number,
    credentials: providerData.credentials,
    bio: providerData.bio,
    isActive: providerData.is_active,
    // Note: created_at and updated_at are not part of ProviderFormValues or InitialProviderData currently
    // If they are needed by the form or display, add them to InitialProviderData
  };
}

export default function EditProviderPage(/*{ params }: EditProviderPageProps*/) {
  const paramsHook = useParams(); // Use the hook
  const providerId = paramsHook.providerId as string; // Get providerId, assert as string

  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []); // Initialize Supabase client

  const [initialData, setInitialData] = useState<InitialProviderData | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (providerId) {
      const loadProvider = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !sessionData.session) {
            throw new Error(sessionError?.message || 'User not authenticated. Redirecting to login...');
          }
          const token = sessionData.session.access_token;

          const data = await fetchProviderById(providerId, token);
          if (data) {
            setInitialData(data);
          } else {
            setInitialData(null); // Mark as not found
            setError(`Provider with ID ${providerId} not found.`);
          }
        } catch (err: unknown) {
          console.error("Failed to fetch provider:", err);
          let errorMessage = "Failed to load provider data.";
          if (err instanceof Error) {
            errorMessage = err.message;
          } else if (typeof err === 'string') {
            errorMessage = err;
          }
          setError(errorMessage);
          setInitialData(null);
          if (errorMessage.includes('User not authenticated')) {
            // router.push('/login'); // Optionally redirect to login
          }
        }
        setIsLoading(false);
      };
      loadProvider();
    }
  }, [providerId, router, supabase]);

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