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
    accessorKey: 'patientName',
    header: 'Patient',
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <Link href={`/admin/appointments/${appointment.id}`} className="hover:underline">
          {row.getValue('patientName')}
        </Link>
      );
    },
  },
  {
    accessorKey: 'doctorName',
    header: 'Doctor',
  },
  {
    accessorKey: 'clinicName',
    header: 'Clinic',
  },
  {
    accessorKey: 'serviceName',
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
      if (status === 'scheduled') variant = 'default';
      if (status.startsWith('canceled')) variant = 'destructive';

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellActions row={row} />,
  },
]; 