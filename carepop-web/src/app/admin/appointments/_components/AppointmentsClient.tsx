'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminAppointments } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { type AdminAppointment } from '@/lib/types';
import { columns } from './columns';
import { useAuth } from '@/lib/contexts/auth-context';

interface AppointmentsClientProps {
  initialAppointments: AdminAppointment[];
}

export default function AppointmentsClient({ initialAppointments }: AppointmentsClientProps) {
  const { session } = useAuth();

  // For now, we use the initial data. Filtering will trigger refetches via react-query's state.
  // A more advanced implementation could use a local state for filters and pass them to useQuery.
  const {
    data: appointments,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['adminAppointments'],
    // The filter object is passed here, for now it's empty.
    queryFn: () => getAdminAppointments(session!.access_token, {}), 
    initialData: initialAppointments,
    enabled: !!session,
  });

  if (isError) return <div>Failed to load appointments: {error?.message}</div>;

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold">Manage Appointments</h1>
      </div>
      
      <DataTable
        columns={columns}
        data={appointments || []}
        filterColumn="patientName"
        filterPlaceholder="Filter by patient..."
        isLoading={isLoading}
      />
    </>
  );
} 