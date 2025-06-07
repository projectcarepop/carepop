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
  appointment_date: string;
  appointment_time: string;
  patientName: string;
  clinicName: string;
  serviceName: string;
  providerName: string;
}

// Define the raw structure from the backend
interface BackendAppointment {
    id: string;
    status: string;
    appointment_date: string;
    appointment_time: string;
    profiles: { full_name: string } | null;
    clinics: { name: string } | null;
    services: { name: string } | null;
    providers: { first_name: string, last_name: string } | null;
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
        accessorKey: 'appointment_date',
        header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>Date<ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
        cell: ({ row }) => new Date(row.getValue('appointment_date')).toLocaleDateString(),
    },
    {
        accessorKey: 'appointment_time',
        header: 'Time',
    },
    { accessorKey: 'patientName', header: 'Patient' },
    { accessorKey: 'clinicName', header: 'Clinic' },
    { accessorKey: 'serviceName', header: 'Service' },
    { accessorKey: 'providerName', header: 'Provider' },
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
          appointment_date: appt.appointment_date,
          appointment_time: appt.appointment_time,
          patientName: appt.profiles?.full_name ?? 'N/A',
          clinicName: appt.clinics?.name ?? 'N/A',
          serviceName: appt.services?.name ?? 'N/A',
          providerName: appt.providers ? `${appt.providers.first_name} ${appt.providers.last_name}` : 'N/A',
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
    </div>
  );
} 