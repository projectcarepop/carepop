'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AdminAppointment, appointmentStatusEnum } from '@/lib/types';
import { Row } from '@tanstack/react-table';

// This component can use hooks because it's a React component.
const CellActions = ({ row }: { row: Row<AdminAppointment> }) => {
    const appointment = row.original;
    const router = useRouter();

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
            <DropdownMenuItem
              onClick={() => router.push(`/admin/appointments/${appointment.id}`)}
            >
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const columns: ColumnDef<AdminAppointment>[] = [
  {
    id: 'patientName',
    header: 'Patient',
    accessorFn: row => {
      const firstName = row.patient?.firstName || '';
      const lastName = row.patient?.lastName || '';
      return `${firstName} ${lastName}`.trim();
    },
    cell: ({ row }) => {
      const patient = row.original.patient;
      if (!patient) return <span className="text-muted-foreground">No Patient Info</span>;
      
      const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
      
      return (
        <div>
          <Link href={`/admin/appointments/${row.original.id}`} className="font-medium hover:underline">{patientName}</Link>
          <div className="text-sm text-muted-foreground">{patient.email}</div>
        </div>
      );
    }
  },
  {
    accessorKey: 'doctor.fullName',
    header: 'Doctor',
  },
  {
    accessorKey: 'clinic.name',
    header: 'Clinic',
  },
  {
    accessorKey: 'service.name',
    header: 'Service',
  },
  {
    accessorKey: 'appointmentTime',
    header: 'Date & Time',
    cell: ({ row }) => {
      const date = new Date(row.getValue('appointmentTime'));
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as typeof appointmentStatusEnum[number];
      let variant: "default" | "secondary" | "destructive" | "outline" = 'secondary';
      if (status === 'SCHEDULED') variant = 'default';
      if (status?.startsWith('CANCELLED')) variant = 'destructive';

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellActions row={row} />,
  },
]; 