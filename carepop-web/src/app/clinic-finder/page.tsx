import React from 'react'; // Removed useState, useEffect
import { Metadata } from 'next';

// Components that are part of the page layout but don't require client interactivity directly here
// import LocationSearchInput from './components/LocationSearchInput'; 
// import ServiceFilter from './components/ServiceFilter';
// import SearchClinicsButton from './components/SearchClinicsButton';
// The above will be rendered by ClinicFinderClient.tsx

import ClinicFinderClient from './components/ClinicFinderClient'; // Import the new client component
import { Clinic } from '@/lib/types/clinic';
import { Service } from '@/lib/types/service';
// AlertTriangle might be used by ClinicFinderClient if fetchError is passed and handled there

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

async function getClinics(): Promise<Clinic[]> {
  // Use the correct public endpoint
  const url = `${API_BASE_URL}/api/v1/clinics`;
  console.log(`Fetching clinics from: ${url}`);
  try {
    // Use an absolute URL for server-side fetch
    const response = await fetch(url, { cache: 'no-store' }); // Use no-store for dynamic data
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch clinics:", errorText);
      throw new Error(`Failed to fetch clinics: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    return result.data; // The API returns data in a 'data' property
  } catch (error) {
    console.error("An error occurred while fetching clinics:", error);
    return [];
  }
}

async function getServices(): Promise<Service[]> {
  const url = `${API_BASE_URL}/api/v1/services`;
  console.log(`Fetching services from: ${url}`);
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch services:", errorText);
      throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    return result.data; // The API returns data in a 'data' property
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

      <div className="container mx-auto p-4 space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Find a Clinic
          </h1>
          <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Search for FPOP clinics and other healthcare providers. Filter by services and location.
          </p>
        </header>

        {/* Render the client component with fetched data */}
        <ClinicFinderClient 
          initialClinics={clinics} 
          initialServices={services}
          initialFetchError={fetchError} 
        />

      </div>
      <footer className="mt-12 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} CarePop. All rights reserved.</p>
      </footer>
    </>
  );
} 