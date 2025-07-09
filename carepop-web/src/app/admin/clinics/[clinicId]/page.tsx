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

    return <ClinicManagementClient initialContext={context} />;

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