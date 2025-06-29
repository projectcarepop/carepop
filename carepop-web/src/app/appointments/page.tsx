import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getMyAppointments } from '@/services/api';
import { AppointmentsTable } from '@/components/main-dashboard/AppointmentsTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return redirect('/sign-in?redirect=/appointments');
  }

  // Pass only the access token to the service function
  const appointments = await getMyAppointments(session.access_token, { limit: 100 });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="mb-6">
            <Button variant="outline" asChild>
                <Link href="/main-dashboard">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
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