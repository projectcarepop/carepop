'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminUser } from '@/lib/types';

export const columns = (
  onEditRole: (user: AdminUser) => void
): ColumnDef<AdminUser>[] => [
  {
    accessorKey: 'fullName',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return (
        <Badge
          variant={role === 'admin' ? 'default' : 'secondary'}
          className={
            role === 'admin' ? 'bg-green-600 text-white' : 'bg-gray-200'
          }
        >
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date Joined',
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return date.toLocaleDateString();
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;

      return (
        <Button variant="ghost" size="sm" onClick={() => onEditRole(user)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Role
        </Button>
      );
    },
  },
]; 