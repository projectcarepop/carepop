'use client';

import * as React from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getAdminAppointments, getAdminClinics, adminCancelAppointment } from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
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
  const [filters, setFilters] = React.useState({
    clinicId: '',
    patientName: '',
    dateRange: { from: undefined, to: undefined },
  });
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [debouncedPatientName] = useDebounce(filters.patientName, 500);

  const paginationProps = React.useMemo(
    () => ({
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    }),
    [pagination]
  );

  const queryKey = ['adminAppointments', paginationProps, filters.clinicId, debouncedPatientName, filters.dateRange];

  const { data } = useQuery({
    queryKey,
    queryFn: () => getAdminAppointments(session!.access_token, {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      clinicId: (filters.clinicId && filters.clinicId !== 'all') ? filters.clinicId : undefined,
      patientName: debouncedPatientName || undefined,
      date_from: filters.dateRange.from,
      date_to: filters.dateRange.to,
    }),
    initialData: initialAppointments,
    enabled: !!session,
  });

  const appointments = data?.data || [];
  const pageCount = data?.pagination?.totalPages ?? 0;

  const { data: clinics } = useQuery({
    queryKey: ['adminClinicsList'],
    queryFn: () => getAdminClinics(session!.access_token, { limit: 1000 }), // Fetch all for dropdown
    enabled: !!session,
  });

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
                placeholder="Filter by patient name..."
                value={filters.patientName}
                onChange={(e) => setFilters(prev => ({ ...prev, patientName: e.target.value }))}
            />
            <Select onValueChange={(value) => setFilters(prev => ({ ...prev, clinicId: value }))} value={filters.clinicId}>
                <SelectTrigger><SelectValue placeholder="Filter by clinic..." /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Clinics</SelectItem>
                    {clinics?.data?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <DateRangePicker onUpdate={({ range }: any) => setFilters(prev => ({ ...prev, dateRange: range }))} />
        </div>
      <DataTable 
        columns={columns({ onCancel: handleOpenCancelModal })} 
        data={appointments || []} 
        pageCount={pageCount}
        pagination={pagination}
        setPagination={setPagination}
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