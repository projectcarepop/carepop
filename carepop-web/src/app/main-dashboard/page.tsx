import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { MainDashboardClient } from '@/components/main-dashboard/MainDashboardClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Profile, Appointment, MedicalRecord } from '@/lib/types';

type DashboardData = {
  profile: Profile | null;
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
};

async function getDashboardData(accessToken: string): Promise<{ data: DashboardData | null; error: string | null }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return { data: null, error: 'API URL is not configured. Please contact support.' };
  }

  try {
    const headers = { 'Authorization': `Bearer ${accessToken}` };
    
    const [profileRes, appointmentsRes, medicalRecordsRes] = await Promise.all([
      fetch(`${apiUrl}/api/me/profile`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/api/me/appointments`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/api/me/medical-records`, { headers, cache: 'no-store' }),
    ]);

    console.log("--- API Fetch Statuses ---");
    console.log("Profile Response Status:", profileRes.status);
    console.log("Appointments Response Status:", appointmentsRes.status);
    console.log("Medical Records Response Status:", medicalRecordsRes.status);
    console.log("--------------------------");

    if (!profileRes.ok) throw new Error('Failed to fetch user profile.');
    if (!appointmentsRes.ok) throw new Error('Failed to fetch appointments.');
    if (!medicalRecordsRes.ok) throw new Error('Failed to fetch medical records.');

    const profile = await profileRes.json();
    const appointmentsPayload = await appointmentsRes.json();
    const medicalRecordsPayload = await medicalRecordsRes.json();
    
    const data: DashboardData = {
      profile,
      appointments: appointmentsPayload?.appointments || [],
      medicalRecords: medicalRecordsPayload?.records || [],
    };

    return { data, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred while loading dashboard data.';
    console.error("Dashboard data fetching error:", errorMessage);
    return { data: null, error: errorMessage };
  }
}

export default async function MainDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return redirect('/sign-in');
  }

  const { data, error } = await getDashboardData(session.access_token);

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>
            {error} Please try again later or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <MainDashboardClient 
      profile={data?.profile || null}
      initialAppointments={data?.appointments || []}
      initialMedicalRecords={data?.medicalRecords || []}
    />
  );
}
