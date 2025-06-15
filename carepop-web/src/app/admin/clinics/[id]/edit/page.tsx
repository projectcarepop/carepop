'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClinicForm, ClinicFormValues } from '../../components/ClinicForm'; 
import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useState, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
// import { toast } from '@/components/ui/use-toast';

// Type for the data fetched from the API, aligning with ClinicFormValues + id
export type InitialClinicData = Partial<ClinicFormValues> & { 
  id: string; 
  name?: string;
  fullAddress?: string | null;
  streetAddress?: string | null;
  locality?: string | null;
  region?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  websiteUrl?: string | null;
  operatingHours?: string | null;
  servicesOffered?: string[] | null;
  fpopChapterAffiliation?: string | null;
  additionalNotes?: string | null;
  isActive?: boolean;
  // createdAt and updatedAt can be added if needed for display, but are not typically part of the form values
  // createdAt?: string;
  // updatedAt?: string;
};

// Fetches a single clinic by ID from the backend
async function fetchClinicById(id: string, token: string): Promise<InitialClinicData | null> {
  console.log(`Fetching clinic with ID: ${id}`);
  const response = await fetch(`/api/v1/admin/clinics/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      console.error(`Clinic with ID ${id} not found.`);
      return null;
    }
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Failed to fetch clinic ${id}: ${errorData.message || response.statusText} (Status: ${response.status})`);
  }

  const result = await response.json();
  const clinicData = result.data; 

  if (!clinicData) {
    console.error(`No data found for clinic with ID ${id} in API response.`);
    return null;
  }

  // Transform snake_case from backend to camelCase for frontend form
  return {
    id: clinicData.id,
    name: clinicData.name,
    fullAddress: clinicData.full_address,
    streetAddress: clinicData.street_address,
    locality: clinicData.locality,
    region: clinicData.region,
    postalCode: clinicData.postal_code,
    countryCode: clinicData.country_code,
    latitude: clinicData.latitude,
    longitude: clinicData.longitude,
    contactPhone: clinicData.contact_phone,
    contactEmail: clinicData.contact_email,
    websiteUrl: clinicData.website_url,
    operatingHours: clinicData.operating_hours,
    servicesOffered: clinicData.services_offered ?? [],
    fpopChapterAffiliation: clinicData.fpop_chapter_affiliation,
    additionalNotes: clinicData.additional_notes,
    isActive: clinicData.is_active !== undefined ? clinicData.is_active : true,
  };
}

export default function EditClinicPage() {
  const params = useParams();
  const clinicId = params.id as string;

  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [initialData, setInitialData] = useState<InitialClinicData | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clinicId) {
      const loadClinic = async () => {
        setIsLoading(true);
        setError(null);
        setInitialData(undefined);
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !sessionData.session) {
            throw new Error(sessionError?.message || 'User not authenticated. Please log in.');
          }
          const token = sessionData.session.access_token;
          const data = await fetchClinicById(clinicId, token);
          if (data) {
            setInitialData(data);
          } else {
            setError(`Clinic with ID ${clinicId} not found.`);
            setInitialData(null);
          }
        } catch (err: unknown) {
          console.error("Failed to fetch clinic:", err);
          let errorMessage = "Failed to load clinic data.";
          if (err instanceof Error) {
            errorMessage = err.message;
          }
          setError(errorMessage);
          setInitialData(null);
        }
        setIsLoading(false);
      };
      loadClinic();
    }
  }, [clinicId, supabase]);

  const handleSuccess = () => {
    console.log('Clinic updated successfully. Navigating back to list...');
    router.push('/admin/clinics');
  };

  if (isLoading || initialData === undefined) {
    return <div className="container mx-auto py-10 text-center">Loading clinic data...</div>;
  }

  if (error && !initialData) {
    return <div className="container mx-auto py-10 text-center text-red-500">Error: {error}</div>;
  }
  
  if (!initialData && !isLoading) {
     return <div className="container mx-auto py-10 text-center">Clinic not found. It may have been deleted or the ID is incorrect.</div>;
  }

  if (!initialData) {
      return <div className="container mx-auto py-10 text-center">Failed to load clinic data or clinic not found.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/clinics">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clinic List
          </Link>
        </Button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Clinic</h1>
        {initialData.name && <span className="text-xl text-muted-foreground">({initialData.name})</span>}
      </div>
      <ClinicForm initialData={initialData} onSubmitSuccess={handleSuccess} mode="edit" clinicId={clinicId} />
    </div>
  );
} 