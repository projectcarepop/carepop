'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Appointment {
  id: string;
  appointment_datetime: string;
  status: string;
  service?: { name: string };
  clinic?: { name: string };
  provider?: { name: string };
}

export function AppointmentsList({ appointments }: { appointments: Appointment[] }) {
  if (!appointments || appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This user has no appointments.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
          <CardDescription>A list of the user&apos;s past and upcoming appointments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-semibold">{appt.service?.name || 'Service Name'}</p>
                <p className="text-sm text-muted-foreground">
                  at {appt.clinic?.name || 'Clinic Name'} with {appt.provider?.name || 'Provider Name'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(appt.appointment_datetime).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant={appt.status === 'Confirmed' ? 'default' : 'secondary'}>{appt.status}</Badge>
                <Button size="sm" asChild>
                  <Link href={`/admin/appointments/${appt.id}/report`}>
                    View Report
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
} 