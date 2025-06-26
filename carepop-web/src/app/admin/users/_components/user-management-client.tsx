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
import { getAdminUsers, updateUserRole } from '@/services/api';
import { createClient } from '@/lib/supabase/client';
import type { AdminUser } from '@/lib/types';

// --- Role Selector Component ---
// This component renders a dropdown to change a user's role and
// handles the mutation to update it on the backend.

function RoleSelector({ user }: { user: AdminUser }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const supabase = createClient(); // Create a client-side Supabase client

    const mutation = useMutation({
        mutationFn: (newRole: 'admin' | 'patient') => {
            return updateUserRole(supabase, user.id, newRole);
        },
        onSuccess: (updatedUser) => {
            toast({
                title: 'Success!',
                description: `User role updated to ${updatedUser.role}.`,
            });
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message || 'Failed to update user role.',
                variant: 'destructive',
            });
        },
    });

    return (
        <Select 
            onValueChange={(value: 'admin' | 'patient') => mutation.mutate(value)} 
            defaultValue={user.role}
            disabled={mutation.isPending}
        >
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
        </Select>
    );
}

// --- Column Definitions for TanStack Table ---

export const columns: ColumnDef<AdminUser>[] = [
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'fullName',
    header: 'Full Name',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => <RoleSelector user={row.original} />,
  },
    {
    accessorKey: 'createdAt',
    header: 'Joined Date',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
            Copy user ID
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// --- Main Client Component ---

interface UserManagementClientProps {
    initialUsers: AdminUser[];
}

export function UserManagementClient({ initialUsers }: UserManagementClientProps) {
    const supabase = createClient();
    
    // Use TanStack Query to manage the user data on the client.
    // This allows for automatic refetching and caching.
    const { data: users } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: () => getAdminUsers(supabase),
        initialData: initialUsers,
    });
  
  return <DataTable columns={columns} data={users || []} />;
} 