import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMyEnrichedRecords } from '@/services/api';
import RecordListClient from '@/components/records/RecordListClient';
import { Button } from '@/components/ui/button';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MedicalRecordWithRelations } from '@/lib/types';

export default async function MedicalRecordsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/sign-in');
  }

  let records: MedicalRecordWithRelations[] = [];
  let fetchError: string | null = null;

  try {
    const result = await getMyEnrichedRecords(session.access_token);
    records = result.records || [];
  } catch (error) {
    console.error("Failed to fetch medical records:", error);
    fetchError = error instanceof Error ? error.message : "An unknown error occurred.";
  }

  return (
    <div className="container mx-auto py-8">
        <div className="mb-6">
            <Button variant="outline" asChild>
                <Link href="/main-dashboard">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">My Medical Records</h1>
      
      {fetchError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Fetching Records</AlertTitle>
          <AlertDescription>
            {fetchError} Please try again later.
          </AlertDescription>
        </Alert>
      ) : (
        <RecordListClient initialRecords={records} />
      )}
    </div>
  );
}
