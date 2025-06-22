import { auth } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from 'next/cache';
import { ClinicTableClient } from './ClinicTableClient';

// This type can be simplified as we get all data now
export interface Clinic {
  id: string;
  name: string;
  street_address?: string | null;
  locality?: string | null;
  region?: string | null;
  contact_phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

async function getClinics(): Promise<Clinic[]> {
  noStore();
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("Unauthorized: No token found.");
  }

  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!backendApiUrl) {
    throw new Error("Backend API URL is not configured.");
  }

  const response = await fetch(`${backendApiUrl}/api/v1/clinics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Error response from backend:", errorBody);
    throw new Error(`Failed to fetch clinics: ${response.statusText}`);
  }

  const clinics: Clinic[] = await response.json();
  return clinics;
}

export async function ClinicTable() {
  try {
    const clinics = await getClinics();
    return <ClinicTableClient data={clinics} />;
  } catch (error) {
    console.error("Failed to fetch and render clinics:", error);
    // Render an error state or an empty table
    return (
        <div className="p-4 rounded-md border border-destructive bg-destructive/10">
            <h3 className="font-semibold text-destructive">Failed to load clinics</h3>
            <p className="text-sm text-destructive/80">
                There was an error fetching clinic data from the server. Please try again later.
            </p>
        </div>
    );
  }
} 