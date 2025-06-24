import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BookingWizard } from '@/components/booking/BookingWizard';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';

/**
 * The server component for the Appointment Booking page.
 * It handles session checks and renders the main booking wizard.
 */
export default async function BookAppointmentPage() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // Protect the route and redirect to the sign-in page if the user is not authenticated.
    return redirect('/sign-in?redirect_to=/book-appointment');
  }

  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center p-4 pt-12">
      <div className="w-full max-w-4xl">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Book a New Appointment
            </CardTitle>
            <CardDescription>
              Follow the steps below to schedule your consultation.
            </CardDescription>
          </CardHeader>
          {/* The interactive part of the booking flow is handled by the client component */}
          <BookingWizard />
        </Card>
      </div>
    </main>
  );
} 