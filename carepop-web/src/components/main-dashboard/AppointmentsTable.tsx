'use client';

import { useState, useEffect } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { format, differenceInHours } from 'date-fns';

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
import { cancelMyAppointment } from '@/services/api';
import type { Appointment, AppointmentWithRelations } from "@/lib/types";
import { useAuth } from '@/lib/contexts/auth-context';

interface AppointmentsTableProps {
  appointments: AppointmentWithRelations[];
}

// Helper for safe date formatting to prevent hydration issues
function formatAppointmentDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return format(date, 'EEE, MMM d, yyyy, h:mm a');
  } catch {
    return 'Invalid Date';
  }
}

// Helper for styling status badges
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

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { mutate: handleCancel, isPending } = useMutation({
    mutationFn: (appointmentId: string) => {
      if (!session?.access_token) {
        throw new Error("You must be logged in to cancel an appointment.");
      }
      return cancelMyAppointment(appointmentId, session.access_token);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Your appointment has been canceled." });
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] }); 
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      // Refetch immediately to ensure fresh data
      queryClient.refetchQueries({ queryKey: ['myAppointments'] });
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

  const isCancelDisabled = (appointment: AppointmentWithRelations) => {
    if (!isClient) return true; // Disable until client-side hydration is complete
    
    try {
      const appointmentDate = new Date(appointment.appointmentTime);
      const hoursUntilAppointment = differenceInHours(appointmentDate, new Date());
      return hoursUntilAppointment < 36;
    } catch {
      return true; // Disable if date parsing fails
    }
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
                {isClient ? formatAppointmentDate(appointment.appointmentTime) : 'Loading...'}
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
                    disabled={
                      (isPending && selectedAppointmentId === appointment.id) ||
                      isCancelDisabled(appointment)
                    }
                  >
                    {isPending && selectedAppointmentId === appointment.id ? 'Canceling...' : 'Cancel'}
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
              <p>This action cannot be undone. This will permanently cancel your appointment.</p>
              <p className="font-bold text-destructive mt-2">
                Please note: Appointments can only be cancelled up to 36 hours in advance.
              </p>
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