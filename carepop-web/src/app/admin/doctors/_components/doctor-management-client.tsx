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
import { getAdminDoctors } from '@/services/api';
import { createClient } from '@/lib/supabase/client';
import type { AdminDoctor } from '@/lib/types';

// --- Column Definitions ---

export const columns: ColumnDef<AdminDoctor>[] = [
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'serviceCategory.name',
    header: 'Specialization',
    cell: ({ row }) => row.original.serviceCategory?.name ?? 'N/A',
  },
  {
    accessorKey: 'clinics',
    header: 'Clinics',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.clinics.map(clinic => (
          <Badge key={clinic.id} variant="secondary">{clinic.name}</Badge>
        ))}
      </div>
    ),
  },
    {
    accessorKey: 'services',
    header: 'Services',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.services.map(service => (
          <Badge key={service.id} variant="outline">{service.name}</Badge>
        ))}
      </div>
    ),
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
          <DropdownMenuItem>Edit Doctor</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// --- Main Client Component ---

interface DoctorManagementClientProps {
    initialDoctors: AdminDoctor[];
}

export function DoctorManagementClient({ initialDoctors }: DoctorManagementClientProps) {
    const supabase = createClient();
    
    const { data: doctors } = useQuery({
        queryKey: ['adminDoctors'],
        queryFn: () => getAdminDoctors(supabase),
        initialData: initialDoctors,
    });
  
  return <DataTable columns={columns} data={doctors || []} />;
} 