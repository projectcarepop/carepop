import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getMyAppointments } from '@/services/api'; // We'll reuse our API function
import { AppointmentsTable } from '@/components/main-dashboard/AppointmentsTable'; // Reuse the table
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function AppointmentsPage() {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/sign-in?redirect=/appointments');
  }

  // Use the new, robust getMyAppointments function
  const appointments = await getMyAppointments(supabase);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Appointments</CardTitle>
            <CardDescription>View and manage all your scheduled appointments.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/book-appointment">
              <PlusCircle className="mr-2 h-4 w-4" /> Book New Appointment
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <AppointmentsTable appointments={appointments} />
        </CardContent>
      </Card>
    </div>
  );
} 