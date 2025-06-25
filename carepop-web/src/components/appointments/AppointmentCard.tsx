"use client"; // Required because CancelAppointmentModal is a client component and used here

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CancelAppointmentModal } from "./CancelAppointmentModal";
import { useRouter } from 'next/navigation'; // For onCancellationSuccess
import { type DashboardAppointment } from '@/lib/types';

type AppointmentStatus = DashboardAppointment['status'];

interface AppointmentCardProps {
  appointment: DashboardAppointment;
}

function getStatusBadgeVariant(
  status: AppointmentStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "scheduled":
      return "default";
    case "completed":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const router = useRouter();

  const isCancellable = 
    appointment.status === "scheduled" &&
    new Date(appointment.appointment_date) > new Date();

  const handleCancellationSuccess = () => {
    router.refresh(); // Re-fetch data on the current page
  };

  return (
    <Card className="mb-6 flex h-full flex-col justify-between shadow-md">
      <div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{appointment.serviceName}</CardTitle>
            <Badge variant={getStatusBadgeVariant(appointment.status)} className="whitespace-nowrap">
              {appointment.status.toUpperCase()}
            </Badge>
          </div>
          <CardDescription>
            {new Date(appointment.appointment_date).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })} 
            at {new Date(appointment.appointment_date).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Clinic:</span> {appointment.clinicName}
            </p>
            <p>
              <span className="font-semibold">Provider:</span> {appointment.doctorName}
            </p>
          </div>
        </CardContent>
      </div>
      {isCancellable && (
        <CardFooter className="mt-auto border-t pt-4">
          <CancelAppointmentModal 
            appointmentId={appointment.id} 
            appointmentName={`${appointment.serviceName} at ${appointment.clinicName}`}
            onCancellationSuccess={handleCancellationSuccess}
          >
            <Button variant="outline" className="w-full">Cancel Appointment</Button>
          </CancelAppointmentModal>
        </CardFooter>
      )}
    </Card>
  );
} 