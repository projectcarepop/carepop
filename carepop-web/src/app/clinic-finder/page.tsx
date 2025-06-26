import React from 'react';
import { Metadata } from 'next';
import ClinicFinderClient from './components/ClinicFinderClient';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Tables } from '@/types/supabase';

// Components that are part of the page layout but don't require client interactivity directly here
// import LocationSearchInput from './components/LocationSearchInput'; 
// import ServiceFilter from './components/ServiceFilter';
// import SearchClinicsButton from './components/SearchClinicsButton';
// The above will be rendered by ClinicFinderClient.tsx

// --- Start: New Inferred Types ---
type Clinic = Tables<'clinics'>;
type Service = Tables<'services'>;
// --- End: New Inferred Types ---

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Find a Clinic - CarePoP',
  description: 'Search for FPOP clinics and other healthcare providers near you. Filter by services and location to find the care you need.',
  alternates: {
    canonical: '/clinic-finder',
  },
  openGraph: {
    title: 'Clinic Finder - CarePoP',
    description: 'Search for clinics and healthcare providers near you.',
    url: '/clinic-finder',
  },
  twitter: {
    title: 'Clinic Finder - CarePoP',
    description: 'Search for clinics and healthcare providers near you.',
  }
};

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: 'https://www.carepop.ph/clinic-finder',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.carepop.ph/clinic-finder?q={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  }
};

const exampleClinicSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: 'CarePoP Sample Clinic',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Health St',
    addressLocality: 'Manila',
    addressRegion: 'NCR',
    postalCode: '1000',
    addressCountry: 'PH'
  },
  telephone: '+63288887777',
  url: 'https://www.carepop.ph/clinic/sample-clinic'
};

export default async function ClinicFinderPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  let clinics: Clinic[] = [];
  let services: Service[] = [];
  let fetchError: string | null = null;

  try {
    // Fetch both clinics and services in parallel
    const clinicsPromise = supabase.from('clinics').select('*').eq('is_active', true);
    const servicesPromise = supabase.from('services').select('*').eq('is_active', true);

    const [clinicsResult, servicesResult] = await Promise.all([
      clinicsPromise,
      servicesPromise,
    ]);

    if (clinicsResult.error) {
      console.error('Error fetching clinics:', clinicsResult.error.message);
      // Throwing the error to be caught by the catch block below
      throw new Error(`Failed to fetch clinics: ${clinicsResult.error.message}`);
    }
    clinics = clinicsResult.data || [];
    
    if (servicesResult.error) {
      console.error('Error fetching services:', servicesResult.error.message);
      // Throwing the error to be caught by the catch block below
      throw new Error(`Failed to fetch services: ${servicesResult.error.message}`);
    }
    services = servicesResult.data || [];

  } catch (error) {
    console.error("Error in ClinicFinderPage (Server Component) while fetching initial data:", error);
    fetchError = error instanceof Error ? error.message : "An unknown error occurred while loading page data.";
    // clinics and services will remain empty
    clinics = [];
    services = [];
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(exampleClinicSchema) }}
      />
      
      {/* The ClinicFinderClient now controls the entire page layout below the header */}
      <ClinicFinderClient 
        initialClinics={clinics} 
        initialServices={services}
        initialFetchError={fetchError} 
      />
    </>
  );
} 