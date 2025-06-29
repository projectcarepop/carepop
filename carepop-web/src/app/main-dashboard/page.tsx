import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { MainDashboardClient } from '@/components/main-dashboard/MainDashboardClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { getMyProfile, getMyAppointments, getMyMedicalRecords } from '@/services/api';

// This line prevents Next.js from trying to statically build this page.
export const dynamic = 'force-dynamic';

// This function is now refactored to use the centralized service layer.
async function getDashboardData(accessToken: string) {
  // It no longer contains direct fetch logic.
  // It now uses Promise.all to call the imported service functions in parallel for performance.
  try {
    const [profile, appointments, medicalRecords] = await Promise.all([
      getMyProfile(accessToken),
      getMyAppointments(accessToken),
      getMyMedicalRecords(accessToken)
    ]);

    return { profile, appointments, medicalRecords, error: null };
  } catch (e: any) {
    console.error("Dashboard data fetching failed via service layer:", e);
    // Return the error message from the failed promise.
    return { profile: null, appointments: [], medicalRecords: [], error: e.message };
  }
}

export default async function MainDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>Could not retrieve user session. Please try signing in again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // The call to getDashboardData now passes the access token.
  const { profile, appointments, medicalRecords, error: dataError } = await getDashboardData(session.access_token);

  if (dataError || !profile) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>{dataError || 'Failed to load profile.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <MainDashboardClient 
      profile={profile}
      initialAppointments={appointments}
      initialMedicalRecords={medicalRecords}
    />
  );
}