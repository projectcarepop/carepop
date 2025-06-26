'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/use-toast';
import { getAdminClinics, upsertClinic } from '@/services/api';
import { createClient } from '@/lib/supabase/client';
import type { Clinic } from '@/lib/types';

// --- Status Selector Component ---

function StatusSelector({ clinic }: { clinic: Clinic }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const supabase = createClient();

    const mutation = useMutation({
        mutationFn: (newStatus: 'pending' | 'approved' | 'rejected') => {
            // The upsertClinic function can be used to update the status.
            return upsertClinic(supabase, { status: newStatus }, clinic.id);
        },
        onSuccess: () => {
            toast({
                title: 'Success!',
                description: `Clinic status updated.`,
            });
            queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update clinic status.',
                variant: 'destructive',
            });
        },
    });

    return (
        <Select 
            onValueChange={(value: 'pending' | 'approved' | 'rejected') => mutation.mutate(value)} 
            defaultValue={clinic.status ?? 'pending'}
            disabled={mutation.isPending}
        >
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
        </Select>
    );
}

// --- Column Definitions ---

export const columns: ColumnDef<Clinic>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }) => {
        return `${row.original.address || 'N/A'}, ${row.original.city || 'N/A'}, ${row.original.province || 'N/A'}`;
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusSelector clinic={row.original} />,
  },
  {
    accessorKey: 'createdAt',
    header: 'Submitted On',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
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
          <DropdownMenuItem>Edit Clinic</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// --- Main Client Component ---

interface ClinicManagementClientProps {
    initialClinics: Clinic[];
}

export function ClinicManagementClient({ initialClinics }: ClinicManagementClientProps) {
    const supabase = createClient();
    
    const { data: clinics } = useQuery({
        queryKey: ['adminClinics'],
        queryFn: () => getAdminClinics(supabase),
        initialData: initialClinics,
    });
  
  return <DataTable columns={columns} data={clinics || []} />;
} 