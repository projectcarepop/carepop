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
          className="h-auto p-0 text-left justify-start"
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      
      // Debug: log the first user's structure to see what fields are available
      if (row.index === 0) {
        console.log('[FRONTEND COLUMNS] First user data structure:', {
          fullName: user.fullName,
          firstName: user.firstName,
          lastName: user.lastName,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          allFields: Object.keys(user)
        });
      }
      
      // Try multiple approaches to get the full name
      let displayName = user.fullName;
      
      if (!displayName) {
        // Try camelCase fields (Drizzle schema)
        const firstName1 = user.firstName || '';
        const lastName1 = user.lastName || '';
        if (firstName1 || lastName1) {
          displayName = `${firstName1} ${lastName1}`.trim();
        }
      }
      
      if (!displayName) {
        // Try snake_case fields (database/Supabase)
        const firstName2 = user.first_name || '';
        const lastName2 = user.last_name || '';
        if (firstName2 || lastName2) {
          displayName = `${firstName2} ${lastName2}`.trim();
        }
      }
      
      // Final fallback
      if (!displayName) {
        displayName = user.email || 'N/A';
      }
      
      return (
        <div className="text-left font-medium">{displayName}</div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: () => (
      <div className="text-left">Email</div>
    ),
    cell: ({ row }) => (
      <div className="text-left">{row.original.email}</div>
    ),
  },
  {
    accessorKey: 'role',
    header: () => (
      <div className="text-center">Role</div>
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      const getBadgeProps = (role: string) => {
        switch (role) {
          case 'admin':
            return { variant: 'default' as const, className: 'bg-green-600 text-white' };
          case 'manager':
            return { variant: 'default' as const, className: 'bg-blue-600 text-white' };
          case 'patient':
            return { variant: 'secondary' as const, className: 'bg-gray-200' };
          default:
            return { variant: 'secondary' as const, className: 'bg-gray-200' };
        }
      };
      
      const badgeProps = getBadgeProps(role);
      
      return (
        <div className="text-center">
          <Badge
            variant={badgeProps.variant}
            className={badgeProps.className}
          >
            {role}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: () => (
      <div className="text-left">Date Joined</div>
    ),
    cell: ({ row }) => {
      const dateValue = row.getValue('createdAt');
      if (!dateValue) return <div className="text-left">N/A</div>;
      try {
        const date = new Date(dateValue as string);
        // Check if the date is valid before formatting
        const formattedDate = isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
        return <div className="text-left">{formattedDate}</div>;
      } catch {
        return <div className="text-left">Invalid Date</div>;
      }
    },
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right">Actions</div>
    ),
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="text-right">
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
        </div>
      );
    },
  },
]; 