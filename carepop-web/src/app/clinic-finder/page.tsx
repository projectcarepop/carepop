import React from 'react';
import { Metadata } from 'next';
import ClinicFinderClient from './components/ClinicFinderClient';
import { apiClient } from '@/lib/apiClient';
import { type InferResponseType } from 'hono/client';

// Components that are part of the page layout but don't require client interactivity directly here
// import LocationSearchInput from './components/LocationSearchInput'; 
// import ServiceFilter from './components/ServiceFilter';
// import SearchClinicsButton from './components/SearchClinicsButton';
// The above will be rendered by ClinicFinderClient.tsx

// --- Start: New Inferred Types ---
type ClinicsResponse = InferResponseType<typeof apiClient.public.clinics.$get>;
type Clinic = ClinicsResponse extends { data: (infer T)[] } ? T : never;

type ServicesResponse = InferResponseType<typeof apiClient.public.services.$get>;
type Service = ServicesResponse extends { data: (infer T)[] } ? T : never;
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

async function getClinics(): Promise<Clinic[]> {
  try {
    const res = await apiClient.public.clinics.$get();
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to fetch clinics:", errorText);
      throw new Error(`Failed to fetch clinics`);
    }
    const data = await res.json();
    return data.data ?? [];
  } catch (error) {
    console.error("An error occurred while fetching clinics:", error);
    return [];
  }
}

async function getServices(): Promise<Service[]> {
  try {
    const res = await apiClient.public.services.$get();
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Failed to fetch services:", errorText);
      throw new Error(`Failed to fetch services`);
    }
    const data = await res.json();
    return data.data ?? [];
  } catch (error) {
    console.error("An error occurred while fetching services:", error);
    return [];
  }
}

export default async function ClinicFinderPage() {
  let clinics: Clinic[] = [];
  let services: Service[] = [];
  let fetchError: string | null = null;

  try {
    // Fetch both clinics and services in parallel
    [clinics, services] = await Promise.all([
      getClinics(),
      getServices()
    ]);
  } catch (error) {
    console.error("Error in ClinicFinderPage (Server Component) while fetching initial data:", error);
    fetchError = error instanceof Error ? error.message : "An unknown error occurred while loading page data.";
    // clinics and services will remain empty
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