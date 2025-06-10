'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useDebounce } from '@/hooks/useDebounce';
import { fetcher } from '@/lib/utils/fetcher';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface Appointment {
  id: string;
  appointment_datetime: string;
  status: string;
  service?: { name: string };
  clinic?: { name: string };
  provider?: { name: string };
}

interface AppointmentsListProps {
  userId: string;
}

export function AppointmentsList({ userId }: AppointmentsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const apiUrl = `/api/v1/admin/users/${userId}/appointments?search=${debouncedSearchTerm}`;
  const { data: appointments, error, isLoading } = useSWR<Appointment[]>(apiUrl, fetcher);

  const getStatusVariant = (status: string): BadgeVariant => {
    const s = status.toLowerCase();
    if (s === 'confirmed') return 'default';
    if (s === 'completed') return 'secondary';
    if (s === 'cancelled') return 'destructive';
    return 'outline';
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by status (e.g., Confirmed, Completed)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {error && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-red-500">
                  Failed to load appointments.
                </TableCell>
              </TableRow>
            )}
            {appointments && appointments.length > 0 ? (
              appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/appointments/${appointment.id}`} className="text-blue-600 hover:underline">
                      {appointment.service?.name || 'N/A'}
                    </Link>
                  </TableCell>
                  <TableCell>{appointment.provider?.name || 'N/A'}</TableCell>
                  <TableCell>{new Date(appointment.appointment_datetime).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              !isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No appointments found.
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 