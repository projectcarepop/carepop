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
import { ArrowUpDown } from 'lucide-react';

// Define the structure of an Appointment for the frontend
export interface Appointment {
  id: string;
  status: string;
  appointment_datetime: string;
  user_id: string;
  clinic_id: string;
  service_id: string;
  provider_id: string;
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

export function AppointmentTable() {
  const [data, setData] = React.useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

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
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge variant={row.getValue('status') === 'confirmed' ? 'default' : 'secondary'}>{row.getValue('status')}</Badge>
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const appointment = row.original;
            if (appointment.status === 'pending_confirmation') {
                return <Button onClick={() => handleConfirm(appointment.id)}>Confirm</Button>;
            }
            return null;
        },
    },
  ];

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) throw new AppError('User not authenticated.', 401);

      const response = await fetch('/api/v1/admin/appointments', {
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
  }, [supabase]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) return <div>Loading appointments...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
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
      <div className="p-4 text-center text-sm text-muted-foreground">
        Note: Displaying IDs for Patient, Clinic, Service, and Provider. Name resolution will be implemented next.
      </div>
    </div>
  );
} 