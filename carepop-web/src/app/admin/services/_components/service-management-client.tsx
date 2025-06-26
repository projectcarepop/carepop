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
import { Switch } from "@/components/ui/switch"
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/use-toast';
import { getAdminServices, upsertService } from '@/services/api';
import { createClient } from '@/lib/supabase/client';
import type { AdminService } from '@/lib/types';

// --- Active Toggle Component ---
function ActiveToggle({ service }: { service: AdminService }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const supabase = createClient();

    const mutation = useMutation({
        mutationFn: (newStatus: boolean) => {
            return upsertService(supabase, { isActive: newStatus }, service.id);
        },
        onSuccess: () => {
            toast({ title: 'Success!', description: 'Service status updated.' });
            queryClient.invalidateQueries({ queryKey: ['adminServices'] });
        },
        onError: (error) => {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        },
    });

    return (
        <Switch
            checked={service.isActive}
            onCheckedChange={(value) => mutation.mutate(value)}
            disabled={mutation.isPending}
        />
    );
}


// --- Column Definitions ---

export const columns: ColumnDef<AdminService>[] = [
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
    accessorKey: 'serviceCategory.name',
    header: 'Category',
    cell: ({ row }) => row.original.serviceCategory?.name ?? 'N/A',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => `₱${row.original.price}`,
  },
    {
    accessorKey: 'durationMinutes',
    header: 'Duration (min)',
  },
  {
    accessorKey: 'isActive',
    header: 'Active',
    cell: ({ row }) => <ActiveToggle service={row.original} />,
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
          <DropdownMenuItem>Edit Service</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// --- Main Client Component ---

interface ServiceManagementClientProps {
    initialServices: AdminService[];
}

export function ServiceManagementClient({ initialServices }: ServiceManagementClientProps) {
    const supabase = createClient();
    
    const { data: services } = useQuery({
        queryKey: ['adminServices'],
        queryFn: () => getAdminServices(supabase),
        initialData: initialServices,
    });
  
  return <DataTable columns={columns} data={services || []} />;
} 