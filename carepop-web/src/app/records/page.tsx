import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMyEnrichedRecords } from '@/services/api';
import RecordListClient from '@/components/records/RecordListClient';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default async function MedicalRecordsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/sign-in');
  }

  const { records } = await getMyEnrichedRecords(session.access_token);

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
      <RecordListClient initialRecords={records} />
    </div>
  );
}
