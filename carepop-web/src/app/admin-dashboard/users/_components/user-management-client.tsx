'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
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
} from "@/components/ui/select"
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/components/ui/use-toast';
import { updateUserRole } from '@/services/api';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

// This is the shape of the data we get from the getAdminUsers service
type UserData = Profile;

function RoleSelector({ user }: { user: UserData }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const supabase = createClient();

    const mutation = useMutation({
        mutationFn: ({ role }: { role: 'admin' | 'patient' }) => {
            return updateUserRole(supabase, user.id, role);
        },
        onSuccess: (updatedUser) => {
            toast({
                title: 'Success!',
                description: `User role updated to ${updatedUser.role}.`,
            });
            // Invalidate the query to refetch the user list
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

    const handleRoleChange = (newRole: 'admin' | 'patient') => {
        if (newRole !== user.role) {
            mutation.mutate({ role: newRole });
        }
    };

    return (
        <Select onValueChange={handleRoleChange} defaultValue={user.role}>
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


export const columns: ColumnDef<UserData>[] = [
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'firstName',
    header: 'First Name',
    cell: ({ row }) => `${row.original.firstName || ''} ${row.original.lastName || ''}`,
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
    cell: ({ row }) => {
      const user = row.original;
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
              Copy user ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UserManagementClient({ users }: { users: UserData[] }) {
  return <DataTable columns={columns} data={users} />;
} 