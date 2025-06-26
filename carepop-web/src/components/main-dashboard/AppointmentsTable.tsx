'use client';

import { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/contexts/auth-context';
import { cancelAppointment } from '@/services/api';
import type { Appointment, AppointmentWithRelations } from "@/lib/types";

// --- Type Definition ---
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { supabase } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  const { mutate: handleCancel, isPending } = useMutation({
    mutationFn: (appointmentId: string) => {
      if (!supabase) throw new Error("Supabase client not available.");
      return cancelAppointment(supabase, appointmentId);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Your appointment has been canceled." });
      // Invalidate both queries to ensure dashboard and the full list page are updated
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] }); 
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      toast({ title: "Cancellation Failed", description: error.message, variant: "destructive" });
    },
    onSettled: () => {
      setIsDialogOpen(false);
      setSelectedAppointmentId(null);
    }
  });

  const openConfirmationDialog = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Date & Time</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Clinic</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell className="font-medium">
                {format(new Date(appointment.appointmentTime), 'EEE, MMM d, yyyy, h:mm a')}
              </TableCell>
              <TableCell>{appointment.service?.name ?? 'N/A'}</TableCell>
              <TableCell>{appointment.doctor?.fullName ?? 'N/A'}</TableCell>
              <TableCell>{appointment.clinic?.name ?? 'N/A'}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(appointment.status)}>
                  {appointment.status.replace(/_/g, ' ')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {appointment.status === 'scheduled' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openConfirmationDialog(appointment.id)}
                    disabled={isPending && selectedAppointmentId === appointment.id}
                  >
                    {isPending && selectedAppointmentId === appointment.id ? '...' : 'Cancel'}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel your appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedAppointmentId) {
                  handleCancel(selectedAppointmentId);
                }
              }}
              disabled={isPending}
            >
              {isPending ? 'Canceling...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 