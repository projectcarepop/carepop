'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import type { AppointmentWithRelations } from "@/app/main-dashboard/page";
import type { Appointment } from "@/lib/types";

// --- Type Definition ---
// This should also come from the SDK eventually.
/*
interface Appointment {
  id: string;
  appointment_date: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  serviceName: string;
  doctorName: string;
  clinicName: string;
}
*/

interface AppointmentsTableProps {
  appointments: AppointmentWithRelations[];
}

// --- Helper for styling status badges ---
const getStatusVariant = (status: Appointment['status']) => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'canceled_by_admin':
    case 'canceled_by_patient':
    case 'no_show':
      return 'destructive';
    case 'scheduled':
    default:
      return 'secondary';
  }
};


// --- The Appointments Table Component ---
export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">Date & Time</TableHead>
          <TableHead>Service</TableHead>
          <TableHead>Doctor</TableHead>
          <TableHead>Clinic</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <TableRow key={appointment.id}>
            <TableCell className="font-medium">
              {format(new Date(appointment.appointmentTime), 'EEE, MMM d, yyyy, h:mm a')}
            </TableCell>
            <TableCell>{appointment.service.name}</TableCell>
            <TableCell>{appointment.doctor.fullName}</TableCell>
            <TableCell>{appointment.clinic.name}</TableCell>
            <TableCell className="text-right">
              <Badge variant={getStatusVariant(appointment.status)}>
                {appointment.status.replace(/_/g, ' ')}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 