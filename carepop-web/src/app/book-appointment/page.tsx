import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Container } from "@/components/layout/Container";
import { BookingFlowManager } from './components/BookingFlowManager';

/**
 * The server component for the Appointment Booking page.
 * It handles session checks and renders the main booking wizard client component.
 */
export default async function BookAppointmentPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Protect the route and redirect to the sign-in page if the user is not authenticated.
    return redirect('/sign-in?redirect_to=/book-appointment');
  }

  return (
    <Container>
      <div className="py-10 justify-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4 text-center">Book Your Appointment</h1>
        <p className="text-muted-foreground mb-8 text-center">
          Follow the steps below to find a service, clinic, and time that works for you.
        </p>
        <BookingFlowManager />
      </div>
    </Container>
  );
} 