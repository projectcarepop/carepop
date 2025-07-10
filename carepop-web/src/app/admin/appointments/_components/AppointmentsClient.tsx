'use client';

import * as React from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getAdminAppointments, adminCancelAppointment } from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from 'use-debounce';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AppointmentsClientProps {
  initialAppointments: any;
}

export function AppointmentsClient({ initialAppointments }: AppointmentsClientProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [cancelModal, setCancelModal] = React.useState<{ isOpen: boolean; appointmentId: string | null }>({ isOpen: false, appointmentId: null });
  const [cancellationReason, setCancellationReason] = React.useState('');

  // Server-side filtering and pagination state
  const [patientName, setPatientName] = React.useState('');
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [debouncedPatientName] = useDebounce(patientName, 500);

  const queryKey = ['adminAppointments', pagination, debouncedPatientName];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getAdminAppointments(session!.access_token, {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      patientName: debouncedPatientName || undefined,
    }),
    initialData: initialAppointments,
    enabled: !!session,
  });

  const appointments = Array.isArray(data?.data) ? data.data : [];
  const pageCount = data?.pagination?.totalPages ?? 0;

  const cancelMutation = useMutation({
    mutationFn: ({ appointmentId, reason }: { appointmentId: string, reason: string }) => 
        adminCancelAppointment(appointmentId, reason, session!.access_token),
    onSuccess: () => {
        toast({ title: 'Appointment Canceled', description: 'The appointment has been successfully canceled.' });
        queryClient.invalidateQueries({ queryKey });
        setCancelModal({ isOpen: false, appointmentId: null });
        setCancellationReason('');
    },
    onError: (error: any) => {
        toast({ title: 'Cancellation Failed', description: error.message, variant: 'destructive' });
    }
  });

  const handleOpenCancelModal = (appointmentId: string) => {
    setCancelModal({ isOpen: true, appointmentId });
  };

  const handleConfirmCancellation = () => {
    if (cancelModal.appointmentId && cancellationReason) {
        cancelMutation.mutate({ appointmentId: cancelModal.appointmentId, reason: cancellationReason });
    } else {
        toast({ title: 'Validation Error', description: 'Please provide a reason for cancellation.', variant: 'destructive'});
    }
  };


  return (
    <div className="space-y-4">
        <CardHeader>
            <CardTitle>Manage Appointments</CardTitle>
            <CardDescription>
                View and manage all patient appointments across all clinics.
            </CardDescription>
        </CardHeader>
      <DataTable 
        columns={columns({ onCancel: handleOpenCancelModal })} 
        data={appointments || []} 
        pageCount={pageCount}
        pagination={pagination}
        setPagination={setPagination}
        globalFilter={patientName}
        setGlobalFilter={setPatientName}
        isLoading={isLoading}
      />

      <AlertDialog open={cancelModal.isOpen} onOpenChange={(isOpen) => setCancelModal({ isOpen, appointmentId: null })}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                  <AlertDialogDescription>
                      Please provide a reason for cancelling this appointment. This will be recorded.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-2">
                  <Label htmlFor="cancellationReason">Reason</Label>
                  <Textarea
                      id="cancellationReason"
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder="e.g., Doctor unavailable due to an emergency."
                  />
              </div>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCancellationReason('')}>Close</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmCancellation} disabled={cancelMutation.isPending}>
                    {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 