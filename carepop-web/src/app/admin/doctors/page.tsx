import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminDoctors } from '@/services/api';
import DoctorsClient from './_components/DoctorsClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

/**
 * This is the main server component for the Admin Doctors page.
 * Its primary responsibilities are:
 * 1.  Securely fetching the initial data for all doctors.
 * 2.  Handling authentication and authorization checks.
 * 3.  Passing the initial data to the client component for interactive display.
 */
export default async function AdminDoctorsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/doctors');
  }

  try {
    const doctors = await getAdminDoctors(session.access_token);
    return <DoctorsClient initialDoctors={doctors} />;
  } catch (error: any) {
    console.error(`[AdminDoctorsPage] Error fetching doctors:`, error);
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
        redirect('/forbidden');
    }

    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Failed to Load Doctors</AlertTitle>
          <AlertDescription>
            <p>There was an error fetching the doctor data from the server.</p>
            <p className="mt-2 font-mono text-xs">Error: {error.message}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
} 