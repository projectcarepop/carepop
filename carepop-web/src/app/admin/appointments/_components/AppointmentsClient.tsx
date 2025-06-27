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
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface AppointmentsClientProps {
  initialAppointments: AdminAppointment[];
}

// YYYY-MM-DD format
const toApiFormat = (date: Date) => format(date, 'yyyy-MM-dd');

export default function AppointmentsClient({ initialAppointments }: AppointmentsClientProps) {
  const { session } = useAuth();
  const [dateRange, setDateRange] = React.useState<{ from?: Date; to?: Date }>({});
  const [selectedClinicId, setSelectedClinicId] = React.useState<string>('all');
  const [globalFilter, setGlobalFilter] = React.useState('');

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

  const setPresetRange = (days: number | 'this_week' | 'clear') => {
    if (days === 'clear') {
        setDateRange({});
        setSelectedClinicId('all');
        return;
    }
    const today = new Date();
    if (days === 'this_week') {
        const startOfWeek = subDays(today, today.getDay());
        setDateRange({ from: startOfWeek, to: today });
    } else {
        setDateRange({ from: subDays(today, days), to: today });
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
       <CardHeader className="p-0">
        <CardTitle>Manage Appointments</CardTitle>
        <CardDescription>
          Filter and view all appointments across the platform.
        </CardDescription>
      </CardHeader>
      
      <div className="space-y-4">
        {/* Row 1: Main Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Input
              placeholder="Filter by patient name..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedClinicId} onValueChange={setSelectedClinicId}>
                <SelectTrigger className="md:w-[280px]">
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
            <div className="flex items-center gap-2">
              <DatePicker
                date={dateRange.from}
                setDate={(date) => setDateRange((prev) => ({ ...prev, from: date }))}
              />
              <span className="text-sm text-muted-foreground">to</span>
              <DatePicker
                date={dateRange.to}
                setDate={(date) => setDateRange((prev) => ({ ...prev, to: date }))}
              />
            </div>
        </div>

        {/* Row 2: Presets & Clear */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Presets:</span>
                <Button variant="ghost" size="sm" onClick={() => setPresetRange(0)}>Today</Button>
                <Button variant="ghost" size="sm" onClick={() => setPresetRange(7)}>Last 7 Days</Button>
                <Button variant="ghost" size="sm" onClick={() => setPresetRange(30)}>Last 30 Days</Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPresetRange('clear')}>Clear Filters</Button>
        </div>
      </div>
      
      <DataTable
        columns={columns}
        data={appointments || []}
        filterColumn="patientName"
        isLoading={isLoading}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
    </div>
  );
} 