import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getAdminAppointments } from '@/services/api';
import { AppointmentManagementClient } from './_components/appointment-management-client';

export const dynamic = 'force-dynamic';

export default async function AppointmentManagementPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch initial data with no filters
  const initialAppointments = await getAdminAppointments(supabase, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Appointment Management</h1>
        <p className="text-muted-foreground">
          A list of all appointments in the system.
        </p>
      </div>
      <AppointmentManagementClient initialAppointments={initialAppointments} />
    </div>
  );
} 