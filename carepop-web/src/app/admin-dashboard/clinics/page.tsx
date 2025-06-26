import { createClient } from '@/lib/supabase/server';
import { ClinicsClient } from '@/components/admin-dashboard/clinics/ClinicsClient';
import { type Clinic } from '@/lib/types';

// This server-side function fetches the initial list of clinics from our API.
async function getClinics(accessToken: string): Promise<Clinic[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        console.error('FATAL: API URL is not configured.');
        return []; // Return empty array on critical config error
    }
    
    try {
        const res = await fetch(`${apiUrl}/api/admin/clinics`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            cache: 'no-store', // Always fetch the latest clinic data for admin
        });

        if (!res.ok) {
            console.error(`Failed to fetch clinics: ${res.statusText}`);
            return []; // Return empty array on fetch error
        }

        const data = await res.json();
        return data.data as Clinic[];
    } catch (error) {
        console.error('An unexpected error occurred while fetching clinics:', error);
        return []; // Return empty array on unexpected errors
    }
}

export default async function ManageClinicsPage() {
    const supabase = createClient();

    const { data: { session } } = await supabase.auth.getSession();

    // The layout already protects this page, but a check here is good practice.
    if (!session) {
        return null; // Or a redirect, though layout handles it.
    }
    
    // Fetch initial data to pass to the client component.
    const initialClinics = await getClinics(session.access_token);
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Manage Clinics</h1>
                <p className="text-muted-foreground">
                    A list of all clinics in the system. You can add, edit, or delete clinics.
                </p>
            </div>
            <ClinicsClient initialData={initialClinics} />
        </div>
    );
} 