import { Metadata } from 'next';
import { Clinic } from '@/lib/types/clinic';
import { Service } from '@/lib/types/service';
import AllClinicsClient from './components/AllClinicsClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Clinics Directory | CarePoP',
  description: 'Browse, search, and filter all our partner clinics.',
};

// This should be in a centralized config, but for now, it's here.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

async function fetchAllClinics(): Promise<Clinic[]> {
  // We don't have a dedicated "get all" endpoint yet, so we use the find-nearby with a huge radius.
  // This is a temporary workaround. A proper endpoint should be created.
  const url = `${API_BASE_URL}/api/v1/clinics/find-nearby?latitude=14.5995&longitude=120.9842&radius=10000000`;
  const response = await fetch(url, { cache: 'no-store' }); // Use no-store for now to ensure freshness
  if (!response.ok) {
    console.error('Failed to fetch clinics:', response.statusText);
    throw new Error('Failed to fetch clinics. Please check the backend service.');
  }
  const data = await response.json();
  return data.data;
}

async function fetchAllServices(): Promise<Service[]> {
  const url = `${API_BASE_URL}/api/v1/services`;
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    console.error('Failed to fetch services:', response.statusText);
    throw new Error('Failed to fetch services. Please check the backend service.');
  }
  const data = await response.json();
  return data.data;
}

export default async function AllClinicsPage() {
  let clinics: Clinic[] = [];
  let services: Service[] = [];
  let error: string | null = null;

  try {
    // Fetch in parallel for efficiency
    [clinics, services] = await Promise.all([
      fetchAllClinics(),
      fetchAllServices(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : 'An unknown error occurred.';
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Clinic Directory
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Find the right clinic for you by searching or filtering by services.
        </p>
      </header>
      
      <main>
        {error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>
              {error} Please try refreshing the page.
            </AlertDescription>
          </Alert>
        ) : (
          <AllClinicsClient initialClinics={clinics} allServices={services} />
        )}
      </main>
    </div>
  );
} 