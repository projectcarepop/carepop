'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminAppointments, getAdminClinics } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { type AdminAppointment, type Clinic } from '@/lib/types';
import { columns } from './columns';
import { useAuth } from '@/lib/contexts/auth-context';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subDays, format } from 'date-fns';
import { useDebounce } from '@/hooks/useDebounce';

interface AppointmentsClientProps {
  initialAppointments: AdminAppointment[];
}

// YYYY-MM-DD format
const toApiFormat = (date: Date) => format(date, 'yyyy-MM-dd');

export default function AppointmentsClient({ initialAppointments }: AppointmentsClientProps) {
  const { session } = useAuth();
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>({});
  const [selectedClinicId, setSelectedClinicId] = React.useState<string>('all');

  const debouncedDateRange = useDebounce(dateRange, 500);

  // Query for fetching clinics for the filter dropdown
  const { data: clinics } = useQuery<Clinic[]>({
    queryKey: ['adminClinics'],
    queryFn: () => getAdminClinics(session!.access_token),
    enabled: !!session,
  });

  const {
    data: appointments,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['adminAppointments', debouncedDateRange, selectedClinicId],
    queryFn: () => {
      if (!session) return Promise.resolve([]);
      const filters: { date_from?: string; date_to?: string; clinicId?: string } = {};
      if (debouncedDateRange.from) {
        filters.date_from = toApiFormat(debouncedDateRange.from);
      }
      if (debouncedDateRange.to) {
        filters.date_to = toApiFormat(debouncedDateRange.to);
      }
      if (selectedClinicId && selectedClinicId !== 'all') {
        filters.clinicId = selectedClinicId;
      }
      return getAdminAppointments(session.access_token, filters);
    },
    initialData: initialAppointments,
    enabled: !!session,
  });

  if (isError) return <div>Failed to load appointments: {error?.message}</div>;

  const setPresetRange = (days: number | 'this_week') => {
    const today = new Date();
    if (days === 'this_week') {
        const startOfWeek = subDays(today, today.getDay());
        setDateRange({ from: startOfWeek, to: today });
    } else {
        setDateRange({ from: subDays(today, days), to: today });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold">Manage Appointments</h1>
      </div>

      <div className="flex flex-col gap-4 rounded-md border p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Filter by Date:</span>
                <DatePicker
                  date={dateRange.from}
                  setDate={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
                />
                <DatePicker
                  date={dateRange.to}
                  setDate={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
                />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Filter by Clinic:</span>
              <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
                  <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="All Clinics" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Clinics</SelectItem>
                      {clinics?.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.id}>
                              {clinic.name}
                          </SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Presets:</span>
            <Button variant="ghost" size="sm" onClick={() => setPresetRange(0)}>Today</Button>
            <Button variant="ghost" size="sm" onClick={() => setPresetRange(1)}>Yesterday</Button>
            <Button variant="ghost" size="sm" onClick={() => setPresetRange(7)}>Last 7 Days</Button>
            <Button variant="ghost" size="sm" onClick={() => setPresetRange(30)}>Last 30 Days</Button>
            <Button variant="ghost" size="sm" onClick={() => setPresetRange('this_week')}>This Week</Button>
        </div>
        <Button variant="outline" onClick={() => { setDateRange({}); setSelectedClinicId('all'); }}>Clear All Filters</Button>
      </div>
      
      <DataTable
        columns={columns}
        data={appointments || []}
        filterColumn="patientName"
        filterPlaceholder="Filter by patient name..."
        isLoading={isLoading}
      />
    </>
  );
} 