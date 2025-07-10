'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyAppointments } from '@/services/api';
import { AppointmentsTable } from '@/components/main-dashboard/AppointmentsTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/lib/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AppointmentsClient() {
  const { session } = useAuth();

  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ['myAppointments'],
    queryFn: () => getMyAppointments(session!.access_token, { limit: 100 }),
    enabled: !!session?.access_token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
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
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Appointments</CardTitle>
          <CardDescription>View and manage all your scheduled appointments.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load appointments. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
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
  );
} 