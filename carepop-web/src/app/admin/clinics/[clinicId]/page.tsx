import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getClinicManagementContext } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { ClinicManagementClient } from './_components/ClinicManagementClient';

export default async function ClinicManagementPage({ params }: { params: { clinicId: string } }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/sign-in');
  }

  try {
    const context = await getClinicManagementContext(params.clinicId, session.access_token);
    
    // Debug: Log the returned context
    console.log('=== SERVER-SIDE: getClinicManagementContext returned ===');
    console.log('context keys:', Object.keys(context || {}));
    console.log('context.clinic exists:', !!context?.clinic);
    console.log('context.allServices length:', context?.allServices?.length || 'undefined');
    console.log('context.allDoctors length:', context?.allDoctors?.length || 'undefined');
    console.log('context.clinic.services length:', context?.clinic?.services?.length || 'undefined');
    console.log('context.clinic.doctors length:', context?.clinic?.doctors?.length || 'undefined');

    if (!context || !context.clinic) {
      return (
         <div className="p-4">
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                Clinic not found. It may have been deleted.
                </AlertDescription>
            </Alert>
         </div>
      );
    }

    return <ClinicManagementClient initialContext={context} clinicId={params.clinicId} />;

  } catch (error) {
    console.error('Failed to load clinic management page:', error);
    return (
        <div className="p-4">
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Page</AlertTitle>
                <AlertDescription>
                    There was a problem fetching the data for this clinic. Please try again later.
                </AlertDescription>
            </Alert>
        </div>
    );
  }
} 