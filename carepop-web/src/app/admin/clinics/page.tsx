import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminClinics } from '@/services/api';
import ClinicsClient from './_components/ClinicsClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

/**
 * This is the main server component for the Admin Clinics page.
 * Its primary responsibilities are:
 * 1.  Securely fetching the initial data from the backend.
 * 2.  Handling authentication and authorization checks.
 * 3.  Passing the initial data to the client component for interactive display.
 */
export default async function AdminClinicsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // First, get the session. If no session, redirect to sign-in.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/clinics');
  }

  // Use a try-catch block for robust error handling during data fetch.
  try {
    // Fetch clinics using our dedicated service function, passing the access token.
    // The service function will handle the actual fetch call and base error handling.
    const clinics = await getAdminClinics(session.access_token);

    // If the fetch is successful, render the client component with the initial data.
    return <ClinicsClient initialClinics={clinics} />;
  } catch (error: any) {
    // If an error occurs (e.g., API is down, auth issue detected by the service),
    // display a user-friendly error message on the page.
    // This prevents the page from crashing and informs the user of the problem.
    console.error(`[AdminClinicsPage] Error fetching clinics:`, error);
    
    // The backend might return a 403 Forbidden, which our service layer translates
    // into an error. We can redirect to a generic "forbidden" page.
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
        redirect('/forbidden');
    }

    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Failed to Load Clinics</AlertTitle>
          <AlertDescription>
            <p>There was an error fetching the clinic data from the server.</p>
            <p className="mt-2 font-mono text-xs">Error: {error.message}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}