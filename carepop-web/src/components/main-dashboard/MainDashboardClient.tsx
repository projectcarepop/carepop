'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { AppointmentsTable } from './AppointmentsTable';
import { Button } from '@/components/ui/button';
import { getMyAppointments } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import type { Profile } from '@/lib/types';
import type { AppointmentWithRelations } from '@/app/main-dashboard/page';

interface MainDashboardClientProps {
  profile: Profile;
  initialAppointments: AppointmentWithRelations[];
}

// --- The Client Component ---
export function MainDashboardClient({ 
  profile, 
  initialAppointments,
}: MainDashboardClientProps) {
  
  const { 
    data: appointments, 
    error: appointmentsError,
    isLoading: isLoadingAppointments 
  } = useQuery({
    queryKey: ['dashboardAppointments'],
    queryFn: () => getMyAppointments({ limit: 3 }),
    initialData: initialAppointments,
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile.firstName || 'User'}!</h1>
          <p className="text-muted-foreground">Here&apos;s a summary of your health activities.</p>
        </div>
        <Button asChild>
          <Link href="/book-appointment">Book New Appointment</Link>
        </Button>
      </div>

      {/* Appointments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAppointments && <p className="text-muted-foreground">Loading appointments...</p>}
          {appointmentsError && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{appointmentsError.message}</AlertDescription>
            </Alert>
          )}
          {appointments && appointments.length > 0 && !isLoadingAppointments && (
            <AppointmentsTable appointments={appointments} />
          )}
          {appointments && appointments.length === 0 && !isLoadingAppointments && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No Appointments Found</h3>
              <p className="text-sm text-muted-foreground mt-2">You don&apos;t have any appointments scheduled yet.</p>
              <Button asChild variant="outline" className="mt-4">
                  <Link href="/book-appointment">Book Your First Appointment</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 