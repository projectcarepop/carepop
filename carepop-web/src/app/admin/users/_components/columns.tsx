'use client';

import { ColumnDef } from '@tanstack/react-table';
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
import { AdminUser } from '@/services/api';

// This interface defines the handlers that our columns will need.
interface ColumnActions {
  onEditRole: (user: AdminUser) => void;
}

export const columns = ({ onEditRole }: ColumnActions): ColumnDef<AdminUser>[] => [
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
      const dateValue = row.getValue('createdAt');
      if (!dateValue) return 'N/A';
      try {
        const date = new Date(dateValue as string);
        // Check if the date is valid before formatting
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
      } catch {
        return 'Invalid Date';
      }
    },
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
            <DropdownMenuItem onClick={() => onEditRole(user)}>
              Edit Role
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 