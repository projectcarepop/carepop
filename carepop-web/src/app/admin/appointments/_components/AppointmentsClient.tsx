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

interface AppointmentsClientProps {
  initialAppointments: any[];
}

export function AppointmentsClient({ initialAppointments }: AppointmentsClientProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [clinicId, setClinicId] = React.useState('');
  const [patientName, setPatientName] = React.useState('');
  const [dateRange, setDateRange] = React.useState<any>();
  const [debouncedPatientName] = useDebounce(patientName, 500);
  
  const [cancelModal, setCancelModal] = React.useState<{ isOpen: boolean; appointmentId: string | null }>({ isOpen: false, appointmentId: null });
  const [cancellationReason, setCancellationReason] = React.useState('');


  const filters = React.useMemo(() => ({
    clinicId: (clinicId && clinicId !== 'all') ? clinicId : undefined,
    patientName: debouncedPatientName || undefined,
    startDate: dateRange?.from ? dateRange.from.toISOString() : undefined,
    endDate: dateRange?.to ? dateRange.to.toISOString() : undefined,
  }), [clinicId, debouncedPatientName, dateRange]);

  const { data: appointments } = useQuery({
    queryKey: ['adminAppointments', filters],
    queryFn: () => getAdminAppointments(session!.access_token, filters),
    initialData: initialAppointments,
    enabled: !!session,
  });

  const { data: clinics } = useQuery({
    queryKey: ['adminClinics'],
    queryFn: () => getAdminClinics(session!.access_token),
    enabled: !!session,
  });
  
  const cancelMutation = useMutation({
    mutationFn: ({ appointmentId, reason }: { appointmentId: string, reason: string }) => adminCancelAppointment(appointmentId, reason, session!.access_token),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminAppointments'] });
        toast({ title: 'Success', description: 'Appointment has been canceled.' });
        setCancelModal({ isOpen: false, appointmentId: null });
        setCancellationReason('');
    },
    onError: (e: any) => toast({ title: 'Error', description: `Failed to cancel appointment: ${e.message}`, variant: 'destructive' }),
  });

  const handleOpenCancelModal = (appointmentId: string) => {
    setCancelModal({ isOpen: true, appointmentId });
  };
  
  const handleConfirmCancellation = () => {
    if (!cancellationReason.trim()) {
        toast({ title: 'Error', description: 'Cancellation reason is required.', variant: 'destructive' });
        return;
    }
    if (cancelModal.appointmentId) {
        cancelMutation.mutate({ appointmentId: cancelModal.appointmentId, reason: cancellationReason });
    }
  };


  return (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
                placeholder="Filter by patient name..."
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
            />
            <Select onValueChange={setClinicId} value={clinicId}>
                <SelectTrigger><SelectValue placeholder="Filter by clinic..." /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Clinics</SelectItem>
                    {clinics?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <DateRangePicker onUpdate={({ range }: { range: { from?: Date, to?: Date }}) => setDateRange(range)} />
        </div>
      <DataTable columns={columns({ onCancel: handleOpenCancelModal })} data={appointments || []} />

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