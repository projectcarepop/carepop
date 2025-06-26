'use client';

import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { getAdminAppointments } from '@/services/api';
import { createClient } from '@/lib/supabase/client';
import type { AdminAppointment } from '@/lib/types';
import { format } from 'date-fns';

// --- Column Definitions ---

export const columns: ColumnDef<AdminAppointment>[] = [
  {
    accessorKey: 'appointment_date',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => format(new Date(row.original.appointment_date), 'PPP p'),
  },
  {
    accessorKey: 'patientName',
    header: 'Patient',
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
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
  {
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>View Details</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// --- Main Client Component ---

interface AppointmentManagementClientProps {
    initialAppointments: AdminAppointment[];
}

export function AppointmentManagementClient({ initialAppointments }: AppointmentManagementClientProps) {
    const supabase = createClient();
    
    // We pass an empty filter object for now. This will be updated later with filter controls.
    const { data: appointments } = useQuery({
        queryKey: ['adminAppointments', {}],
        queryFn: () => getAdminAppointments(supabase, {}),
        initialData: initialAppointments,
    });
  
  return <DataTable columns={columns} data={appointments || []} />;
} 