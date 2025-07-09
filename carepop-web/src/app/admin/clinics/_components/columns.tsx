'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Clinic } from '@/lib/types';

interface ColumnActionsProps {
  onEdit: (clinic: Clinic) => void;
  onDelete: (clinic: Clinic) => void;
  clinic: Clinic;
}

// Create a new component for the cell actions to use hooks
const CellActions: React.FC<ColumnActionsProps> = ({ onEdit, onDelete, clinic }) => {
  const router = useRouter();

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
        <DropdownMenuItem onClick={() => router.push(`/admin/clinics/${clinic.id}`)}>
          View & Manage
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEdit(clinic)}>
          Edit Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(clinic.id)}>
          Copy Clinic ID
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
};

// The columns definition is now a function that accepts handlers for edit and delete
export const columns = ({ onEdit, onDelete }: Omit<ColumnActionsProps, 'clinic'>): ColumnDef<Clinic>[] => [
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
      return <CellActions clinic={clinic} onEdit={onEdit} onDelete={onDelete} />;
    },
  },
]; 