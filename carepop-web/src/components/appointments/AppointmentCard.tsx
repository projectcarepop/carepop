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
import { type InferResponseType } from 'hono/client';
import { apiClient } from "@/lib/apiClient";

// Infer the type from the Hono client response
type AppointmentResponse = InferResponseType<typeof apiClient.me.appointments.$get>;
// The API returns an array of appointments, so we get the type of a single element
type Appointment = AppointmentResponse extends (infer T)[] ? T : never;
type AppointmentStatus = Appointment['status'];

interface AppointmentCardProps {
  appointment: Appointment;
}

function getStatusBadgeVariant(
  status: AppointmentStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "CONFIRMED":
      return "default";
    case "COMPLETED":
      return "default";
    case "PENDING":
      return "secondary";
    case "CANCELLED_BY_USER":
    case "CANCELLED_BY_CLINIC":
    case "NO_SHOW":
      return "destructive";
    default:
      return "outline";
  }
}

export default function AppointmentCard({ appointment }: AppointmentCardProps) {
  const router = useRouter();

  const isCancellable = 
    (appointment.status === "PENDING" || 
     appointment.status === "CONFIRMED") &&
    new Date(appointment.appointmentTime) > new Date(); // And is in the future

  const handleCancellationSuccess = () => {
    router.refresh(); // Re-fetch data on the current page
  };

  return (
    <Card className="mb-6 flex h-full flex-col justify-between shadow-md">
      <div>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{appointment.service.name}</CardTitle>
            <Badge variant={getStatusBadgeVariant(appointment.status)} className="whitespace-nowrap">
              {appointment.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
          <CardDescription>
            {new Date(appointment.appointmentTime).toLocaleDateString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })} 
            at {new Date(appointment.appointmentTime).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Clinic:</span> {appointment.clinic.name}
            </p>
            {appointment.clinic.address_line1 && (
              <p className="text-sm text-gray-600">
                {appointment.clinic.address_line1}, {appointment.clinic.city}
              </p>
            )}
            {appointment.provider && (
              <p>
                <span className="font-semibold">Provider:</span> {appointment.provider.full_name}
                {appointment.provider.specialty && ` (${appointment.provider.specialty})`}
              </p>
            )}
            {appointment.notes && !appointment.cancellation_reason && (
              <p className="mt-2 border-t pt-2 text-sm">
                <span className="font-semibold">Your Notes:</span> {appointment.notes}
              </p>
            )}
            {appointment.cancellation_reason && (
              <p className="mt-2 border-t pt-2 text-sm text-red-700">
                <span className="font-semibold">Cancellation Reason:</span> {appointment.cancellation_reason}
              </p>
            )}
          </div>
        </CardContent>
      </div>
      {isCancellable && (
        <CardFooter className="mt-auto border-t pt-4">
          <CancelAppointmentModal 
            appointmentId={appointment.id} 
            appointmentName={`${appointment.service.name} at ${appointment.clinic.name}`}
            onCancellationSuccess={handleCancellationSuccess}
          >
            <Button variant="outline" className="w-full">Cancel Appointment</Button>
          </CancelAppointmentModal>
        </CardFooter>
      )}
    </Card>
  );
} 