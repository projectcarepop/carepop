import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BookingWizard from '@/components/booking/BookingWizard';
import { Container } from "@/components/layout/Container";

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

  // The BookingWizard component will handle its own data fetching on the client side.
  // This page is now just a protected shell.
  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Book Your Appointment</h1>
        <p className="text-muted-foreground mb-8">
          Follow the steps below to find a service, clinic, and time that works for you.
        </p>
        <BookingWizard />
      </div>
    </Container>
  );
} 