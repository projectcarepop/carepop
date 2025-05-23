import React from 'react';
import { Metadata } from 'next';
// No longer using next/dynamic directly in this server component
// import dynamic from 'next/dynamic'; 

import LocationSearchInput from './components/LocationSearchInput';
import ServiceFilter from './components/ServiceFilter';
import SearchClinicsButton from './components/SearchClinicsButton';
import ClinicList from './components/ClinicList';
import DynamicMapLoader from './components/DynamicMapLoader'; // Import the new loader component
import { Clinic } from '@/lib/types/clinic'; // Import the new Clinic type
import { AlertTriangle } from 'lucide-react';

// // Dynamically import MapDisplay with ssr: false - MOVED to DynamicMapLoader.tsx
// const MapDisplay = dynamic(() => import('./components/MapDisplay'), {
//   ssr: false,
//   loading: () => <div className="h-96 w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm"><p className='text-gray-500 dark:text-gray-400'>Loading map...</p></div>,
// });

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

// Example JSON-LD Schema for the page itself (as a Search Results Page or WebSite)
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

// Example JSON-LD for a single clinic (this would be dynamically generated with real data)
const exampleClinicSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: 'CarePoP Sample Clinic',
  description: 'Providing excellent healthcare services in the community.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Health St',
    addressLocality: 'Manila',
    addressRegion: 'NCR',
    postalCode: '1000',
    addressCountry: 'PH'
  },
  telephone: '+63288887777',
  url: 'https://www.carepop.ph/clinic/sample-clinic' // Placeholder URL for a clinic detail page
  // openingHours: 'Mo-Fr 09:00-17:00', // Example
  // SameAs: ['https://www.facebook.com/sampleclinic'] // Example social media
};

async function getClinics(): Promise<Clinic[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    console.error("API base URL is not configured. Please set NEXT_PUBLIC_API_BASE_URL.");
    // Depending on how critical this is, you might throw an error or return empty/mock data.
    // For now, let's throw to make it obvious during development.
    throw new Error("API base URL is not configured.");
  }

  const response = await fetch(`${apiBaseUrl}/api/v1/directory/clinics`, {
    // cache: 'no-store', // Use this if you want to ensure fresh data on every request during development or for highly dynamic data.
    // next: { revalidate: 3600 } // Or use incremental static regeneration (ISR) - revalidate every hour.
  });

  if (!response.ok) {
    // Log more details for server-side errors
    const errorText = await response.text();
    console.error(`Failed to fetch clinics: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`Failed to fetch clinics. Status: ${response.status}`);
  }

  try {
    const data = await response.json();
    // Add a simple validation for the expected array structure, can be more robust
    if (!Array.isArray(data)) {
        console.error("Fetched data is not an array:", data);
        throw new Error("Invalid data format received from API.");
    }
    return data as Clinic[]; // Assume API returns data matching Clinic[] structure
  } catch (e) {
    console.error("Error parsing JSON response:", e);
    throw new Error("Failed to parse clinic data from API.");
  }
}

export default async function ClinicFinderPage() {
  let clinics: Clinic[] = [];
  let fetchError: string | null = null;

  try {
    clinics = await getClinics();
  } catch (error) {
    console.error("Error in ClinicFinderPage while fetching clinics:", error);
    fetchError = error instanceof Error ? error.message : "An unknown error occurred while loading clinic data.";
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      {/* When listing clinics, you would iterate and generate a script tag for each clinic 
          or a single script tag with an array of clinic objects if appropriate. 
          For this example, just one clinic is shown.
      */}
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="lg:col-span-3 space-y-6 p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white border-b pb-3 mb-4">
              Search Filters
            </h2>
            <LocationSearchInput />
            <ServiceFilter />
            <div className="pt-4">
              <SearchClinicsButton />
            </div>
          </aside>

          <section className="lg:col-span-9 space-y-8">
            {fetchError ? (
              <div className="p-6 border rounded-lg bg-red-50 dark:bg-red-900/30 text-center shadow-sm">
                <AlertTriangle size={32} className="mx-auto mb-3 text-red-500" />
                <p className="text-red-700 dark:text-red-400 font-medium">Could not load clinic data.</p>
                <p className="text-sm text-red-600 dark:text-red-500">{fetchError}</p>
              </div>
            ) : (
              <>
                <div className="h-96 w-full border rounded-lg bg-gray-100 dark:bg-gray-700 shadow-sm overflow-hidden">
                  <DynamicMapLoader clinics={clinics} /> 
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Nearby Clinics</h2>
                  <ClinicList clinics={clinics} />
                </div>
              </>
            )}
          </section>
        </div>
      </div>
      <footer className="mt-12 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} CarePop. All rights reserved.</p>
      </footer>
    </>
  );
} 