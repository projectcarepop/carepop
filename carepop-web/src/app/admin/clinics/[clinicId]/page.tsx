import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminClinicDetails } from '@/services/api';
import ClinicDetailsView from './_components/ClinicDetailsView';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ClinicDetailsPageProps {
  params: {
    clinicId: string;
  };
}

export default async function ClinicDetailsPage({ params }: ClinicDetailsPageProps) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return redirect(`/sign-in?redirect=/admin/clinics/${params.clinicId}`);
  }

  try {
    const clinicDetails = await getAdminClinicDetails(params.clinicId, session.access_token);
    
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Link href="/admin/clinics">
            <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Clinics
            </Button>
        </Link>
        <ClinicDetailsView clinic={clinicDetails} />
      </div>
    );
  } catch (error: any) {
    console.error(`[ClinicDetailsPage] Error:`, error);
    if (error.message.includes('Not found')) {
        return (
             <div className="container mx-auto p-4">
                <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Clinic Not Found</AlertTitle>
                <AlertDescription>
                    <p>The clinic you are looking for does not exist.</p>
                    <Link href="/admin/clinics" className="mt-4 inline-block">
                        <Button variant="secondary">Go Back to Clinics</Button>
                    </Link>
                </AlertDescription>
                </Alert>
            </div>
        )
    }
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Failed to Load Clinic Details</AlertTitle>
          <AlertDescription>
            <p>There was an error fetching the clinic data from the server.</p>
            <p className="mt-2 font-mono text-xs">Error: {error.message}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
} 