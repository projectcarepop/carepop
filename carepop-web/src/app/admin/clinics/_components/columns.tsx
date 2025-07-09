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
import { Clinic } from '@/lib/types';

interface ColumnActions {
  onEdit: (clinic: Clinic) => void;
  onDelete: (clinic: Clinic) => void;
}

// The columns definition is now a function that accepts handlers for edit and delete
export const columns = ({ onEdit, onDelete }: ColumnActions): ColumnDef<Clinic>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }) => {
      const address = row.original.address as { street?: string; city?: string; zip?: string };
      return `${address?.street || ''}, ${address?.city || ''} ${address?.zip || ''}`;
    },
  },
  {
    accessorKey: 'location',
    header: 'Location (Lat, Lon)',
    cell: ({ row }) => {
      const location = row.original.location as { x?: number; y?: number };
      if (location?.y && location?.x) {
        return `${location.y.toFixed(4)}, ${location.x.toFixed(4)}`;
      }
      return 'N/A';
    }
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive');
      return (
        <Badge variant={isActive ? 'default' : 'destructive'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Date Added',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return date.toLocaleDateString();
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const clinic = row.original;

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
              onClick={() => navigator.clipboard.writeText(clinic.id)}
            >
              Copy Clinic ID
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(clinic)}>
              Edit Clinic
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(clinic)}
              className="text-red-600"
            >
              Delete Clinic
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 