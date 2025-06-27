import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminAppointments } from '@/services/api';
import AppointmentsClient from './_components/AppointmentsClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

/**
 * This is the main server component for the Admin Appointments page.
 * It securely fetches the initial data for all appointments and passes it 
 * to the client component for interactive display and filtering.
 */
export default async function AdminAppointmentsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/appointments');
  }

  try {
    const appointments = await getAdminAppointments(session.access_token, {});
    return <AppointmentsClient initialAppointments={appointments} />;
  } catch (error: any) {
    console.error(`[AdminAppointmentsPage] Error fetching appointments:`, error);
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
        redirect('/forbidden');
    }

    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Failed to Load Appointments</AlertTitle>
          <AlertDescription>
            <p>There was an error fetching the appointment data from the server.</p>
            <p className="mt-2 font-mono text-xs">Error: {error.message}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}
