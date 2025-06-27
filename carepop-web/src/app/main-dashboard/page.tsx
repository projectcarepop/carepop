import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MainDashboardClient } from '@/components/main-dashboard/MainDashboardClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Profile, Appointment, MedicalRecord } from '@/lib/types';

// This line prevents Next.js from trying to statically build this page.
export const dynamic = 'force-dynamic';

type DashboardData = {
  profile: Profile | null;
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
};

async function getDashboardData(supabase: any) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { data: null, error: 'Could not retrieve user session.' };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return { data: null, error: 'API URL is not configured.' };

  try {
    const headers = { 'Authorization': `Bearer ${session.access_token}` };
    const [profileRes, appointmentsRes, medicalRecordsRes] = await Promise.all([
      fetch(`${apiUrl}/api/me/profile`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/api/me/appointments`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/api/me/medical-records`, { headers, cache: 'no-store' }),
    ]);

    if (!profileRes.ok || !appointmentsRes.ok || !medicalRecordsRes.ok) {
        throw new Error('One or more data requests failed.');
    }

    const profile = await profileRes.json();
    const appointmentsPayload = await appointmentsRes.json();
    const medicalRecordsPayload = await medicalRecordsRes.json();
    
    const data: DashboardData = { profile, appointments: appointmentsPayload?.appointments || [], medicalRecords: medicalRecordsPayload?.records || [] };
    return { data, error: null };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'An unknown error occurred.' };
  }
}

export default async function MainDashboardPage() {
  // The page MUST call cookies() and pass the store to the client.
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await getDashboardData(supabase);

  if (error || !data) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>{error || "An unknown error occurred."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <MainDashboardClient 
      profile={data.profile}
      initialAppointments={data.appointments}
      initialMedicalRecords={data.medicalRecords}
    />
  );
}