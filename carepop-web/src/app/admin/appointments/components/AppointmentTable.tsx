'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { AppError } from '@/lib/utils/AppError';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Define the structure of an Appointment for the frontend
export interface Appointment {
  id: string;
  status: string;
  appointment_datetime: string;
  user_id: string;
  clinic_id: string;
  service_id: string;
  provider_id: string;
  patient_name?: string;
  clinic_name?: string;
  service_name?: string;
  provider_name?: string;
}

// Define the raw structure from the backend
interface BackendAppointment {
    id: string;
    status: string;
    appointment_datetime: string;
    user_id: string;
    clinic_id: string;
    service_id: string;
    provider_id: string;
}

// Define types for our lookup maps
type NameMap = { [id: string]: string };

const CancelAppointmentDialog = ({
  appointment,
  isOpen,
  onClose,
  onConfirm,
  isCancelling,
}: {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isCancelling: boolean;
}) => {
  const [reason, setReason] = React.useState('');

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Please provide a reason for cancelling this appointment. This will be shared with the user.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <Textarea 
                placeholder="e.g., The provider is unavailable..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
            />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isCancelling}>Back</Button>
          <Button 
            variant="destructive" 
            onClick={() => onConfirm(reason)} 
            disabled={isCancelling || !reason}
          >
            {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export function AppointmentTable({ clinicId }: { clinicId: string }) {
  const [data, setData] = React.useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [appointmentToCancel, setAppointmentToCancel] = React.useState<Appointment | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  
  // State for lookup maps
  const [clinicMap, setClinicMap] = React.useState<NameMap>({});
  const [serviceMap, setServiceMap] = React.useState<NameMap>({});
  const [providerMap, setProviderMap] = React.useState<NameMap>({});
  const { toast } = useToast();

  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  // Effect to fetch all lookup data
  React.useEffect(() => {
    const fetchLookups = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) throw new AppError('User not authenticated.', 401);
        const token = sessionData.session.access_token;
        
        // Fetching all at once. Assuming admin endpoints exist for these.
        // TODO: Create /api/v1/admin/profiles and /api/v1/admin/services if they don't exist
        const [clinicsRes, servicesRes, providersRes] = await Promise.all([
            fetch('/api/v1/admin/clinics', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/v1/admin/services', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/v1/admin/providers', { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        const clinics = await clinicsRes.json();
        const services = await servicesRes.json();
        const providers = await providersRes.json();

        setClinicMap(Object.fromEntries(clinics.data.map((c: { id: string, name: string }) => [c.id, c.name])));
        setServiceMap(Object.fromEntries(services.data.map((s: { id: string, name: string }) => [s.id, s.name])));
        setProviderMap(Object.fromEntries(providers.data.map((p: { id: string, first_name: string, last_name: string }) => [p.id, `${p.first_name} ${p.last_name}`])));

      } catch {
         setError("Failed to load required data. Please try again.");
      }
    };
    fetchLookups();
  }, [supabase]);

  const handleConfirm = async (appointmentId: string) => {
    // Optimistically update the UI
    setData(currentData =>
      currentData.map(appt =>
        appt.id === appointmentId ? { ...appt, status: 'confirmed' } : appt
      )
    );

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) throw new AppError('User not authenticated.', 401);

      const response = await fetch(`/api/v1/admin/appointments/${appointmentId}/confirm`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${sessionData.session.access_token}` },
      });

      if (!response.ok) {
        // Revert the optimistic update on failure
        fetchData(); // Refetch to get the true state
        throw new AppError('Failed to confirm appointment.', response.status);
      }
    } catch (e: unknown) {
      if (e instanceof AppError) {
        setError(e.message);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCancelDialog = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setIsCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setAppointmentToCancel(null);
    setIsCancelDialogOpen(false);
  };
  
  const handleCancelAppointment = async (reason: string) => {
      if (!appointmentToCancel) return;
      setIsCancelling(true);

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) throw new AppError('User not authenticated.', 401);

        const response = await fetch(`/api/v1/admin/appointments/${appointmentToCancel.id}/cancel`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${sessionData.session.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reason }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new AppError(errorData.message || 'Failed to cancel appointment.', response.status);
        }

        toast({ title: "Success", description: "Appointment has been cancelled." });
        fetchData(); // Refresh the table data
        
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'An unknown error occurred.';
        toast({ title: "Error", description: message, variant: "destructive" });
      } finally {
        setIsCancelling(false);
        handleCloseCancelDialog();
      }
  };

  const columns: ColumnDef<Appointment>[] = [
    {
        accessorKey: 'appointment_datetime',
        header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>Date<ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
        cell: ({ row }) => new Date(row.getValue('appointment_datetime')).toLocaleDateString(),
    },
    {
        accessorKey: 'appointment_datetime_time',
        header: 'Time',
        cell: ({ row }) => new Date(row.original.appointment_datetime).toLocaleTimeString(),
    },
    { accessorKey: 'user_id', header: 'Patient ID' },
    { accessorKey: 'clinic_id', header: 'Clinic ID' },
    { accessorKey: 'service_id', header: 'Service ID' },
    { accessorKey: 'provider_id', header: 'Provider ID' },
    {
        accessorKey: 'patient_name',
        header: 'Patient',
        cell: ({ row }) => row.original.patient_name || row.original.user_id
    },
    {
        accessorKey: 'clinic_name',
        header: 'Clinic',
    },
    {
        accessorKey: 'service_name',
        header: 'Service',
    },
    {
        accessorKey: 'provider_name',
        header: 'Provider',
    },
    { 
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
            if (status === 'confirmed') variant = 'default';
            if (status === 'cancelled_by_clinic') variant = 'destructive';
            if (status === 'completed') variant = 'outline'; // Assuming 'outline' can be green-ish
            
            return <Badge variant={variant} className="capitalize">{status.replace(/_/g, " ")}</Badge>
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const appointment = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        {appointment.status === 'pending_confirmation' && (
                            <DropdownMenuItem onClick={() => handleConfirm(appointment.id)}>
                                Confirm Appointment
                            </DropdownMenuItem>
                        )}
                        {appointment.status !== 'cancelled_by_clinic' && appointment.status !== 'completed' && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleOpenCancelDialog(appointment)}
                                >
                                    Cancel Appointment
                                </DropdownMenuItem>
                            </>
                        )}
                        {/* Future actions can be added here */}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
  ];

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) throw new AppError('User not authenticated.', 401);

      const params = new URLSearchParams();
      params.append('clinicId', clinicId);

      const response = await fetch(`/api/v1/admin/appointments?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${sessionData.session.access_token}` },
      });
      if (!response.ok) throw new AppError('Failed to fetch appointments.', response.status);

      const result = await response.json();
      
      const transformedData = (result.data || []).map((appt: BackendAppointment): Appointment => ({
          id: appt.id,
          status: appt.status,
          appointment_datetime: appt.appointment_datetime,
          user_id: appt.user_id,
          clinic_id: appt.clinic_id,
          service_id: appt.service_id,
          provider_id: appt.provider_id,
          // Map names using the lookup tables
          patient_name: appt.user_id, // For now, just show the ID
          clinic_name: clinicMap[appt.clinic_id] || 'N/A',
          service_name: serviceMap[appt.service_id] || appt.service_id,
          provider_name: providerMap[appt.provider_id] || 'N/A',
      }));

      setData(transformedData);
    } catch (e: unknown) {
      if (e instanceof AppError) {
        setError(e.message);
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase, clinicId, clinicMap, serviceMap, providerMap]);

  React.useEffect(() => {
    if (clinicId && Object.keys(clinicMap).length > 0 && Object.keys(serviceMap).length > 0) {
        fetchData();
    }
  }, [fetchData, clinicId, clinicMap, serviceMap]);

  const table = useReactTable({
    data,
    columns,
    state: { 
        sorting,
        columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) return <div>Loading appointments...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
        <div className="flex items-center py-4 gap-4">
            <Input
                placeholder="Filter by patient name..."
                value={(table.getColumn('patient_name')?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                    table.getColumn('patient_name')?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Status <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(() => {
                  const statusMap = table.getColumn('status')?.getFacetedUniqueValues();
                  if (!statusMap) return <div className="p-2">Loading statuses...</div>;

                  const statuses = Array.from(statusMap.keys()).sort();

                  return statuses.map((statusValue) => (
                    <DropdownMenuCheckboxItem
                      key={statusValue}
                      className="capitalize"
                      checked={table.getColumn('status')?.getFilterValue() === statusValue}
                      onCheckedChange={(value) => {
                          if (value) {
                              table.getColumn('status')?.setFilterValue(statusValue);
                          } else {
                              table.getColumn('status')?.setFilterValue(undefined);
                          }
                      }}
                    >
                      {statusValue}
                    </DropdownMenuCheckboxItem>
                  ));
                })()}
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No appointments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <CancelAppointmentDialog 
          appointment={appointmentToCancel}
          isOpen={isCancelDialogOpen}
          onClose={handleCloseCancelDialog}
          onConfirm={handleCancelAppointment}
          isCancelling={isCancelling}
        />
    </div>
  );
} 