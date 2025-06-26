import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getMyAppointments } from '@/services/api'; // We'll reuse our API function
import { AppointmentsTable } from '@/components/main-dashboard/AppointmentsTable'; // Reuse the table
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Appointment, Clinic, DoctorWithProfile, Service } from '@/lib/types';

// This is the expected shape of the data after our backend call
export type AppointmentWithRelations = Appointment & {
  clinic: Clinic | null;
  doctor: DoctorWithProfile | null;
  service: Service | null;
};

export default async function AppointmentsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Fetch all appointments. Our getMyAppointments function is already set up
  // to fetch the enriched data from the backend.
  const allAppointments = await getMyAppointments(supabase);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Appointments</h1>
          <p className="text-muted-foreground">
            View and manage all your scheduled visits.
          </p>
        </div>
        <Button asChild>
          <Link href="/book-appointment">
            <PlusCircle className="mr-2 h-4 w-4" />
            Book New Appointment
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
          <CardDescription>A complete list of your past and upcoming appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          {allAppointments && allAppointments.length > 0 ? (
            <AppointmentsTable appointments={allAppointments} />
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">You have no appointments scheduled.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 