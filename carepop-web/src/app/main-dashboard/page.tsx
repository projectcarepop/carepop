import { redirect } from 'next/navigation';
import { MainDashboardClient } from '@/components/main-dashboard/MainDashboardClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { Profile, Appointment, Clinic, Doctor, Service } from '@/lib/types';

// --- Composite Type for Dashboard ---
// This type combines the base Appointment with its related data for display purposes.
export type AppointmentWithRelations = Appointment & {
  clinic: Pick<Clinic, 'name'>;
  doctor: Pick<Doctor, 'fullName'>;
  service: Pick<Service, 'name'>;
};

// This type represents the complete data structure returned by our fetching function.
type DashboardData = {
  profile: Profile | null;
  appointments: AppointmentWithRelations[];
  error: string | null;
};

// --- Data Fetching Helper ---
async function getDashboardData(accessToken: string): Promise<DashboardData> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('FATAL: NEXT_PUBLIC_API_URL is not configured.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };

  try {
    // We only fetch profile and appointments for this dashboard view.
    const [profileRes, appointmentsRes] = await Promise.all([
      fetch(`${apiUrl}/api/me/profile`, { headers, cache: 'no-store' }),
      fetch(`${apiUrl}/api/me/appointments?limit=3`, { headers, cache: 'no-store' }),
    ]);

    if (profileRes.status === 404) {
      return { profile: null, appointments: [], error: null };
    }
    
    if (!profileRes.ok) throw new Error(`Failed to fetch profile: ${profileRes.statusText}`);
    if (!appointmentsRes.ok) throw new Error(`Failed to fetch appointments: ${appointmentsRes.statusText}`);

    const profileJson = await profileRes.json();
    const appointmentsJson = await appointmentsRes.json();

    return { 
      profile: profileJson.data, // The API should return the correct shape
      appointments: appointmentsJson.data, // The API should return the correct shape
      error: null 
    };
  } catch (error) {
    console.error('Dashboard data fetching error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { profile: null, appointments: [], error: errorMessage };
  }
}

// --- The Server Component Page ---
export default async function MainDashboardPage() {
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return redirect('/sign-in');
  }

  const { profile, appointments, error } = await getDashboardData(session.access_token);
  
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

  if (!profile?.firstName) {
    // Redirect to profile completion if the first name is missing.
    return redirect('/create-profile');
  }
  
  return (
    <MainDashboardClient 
      profile={profile} 
      initialAppointments={appointments}
    />
  );
}
