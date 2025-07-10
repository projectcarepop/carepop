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
          className="h-auto p-0 text-left justify-start"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-left font-medium">{row.original.name}</div>
    ),
  },
  {
    id: 'address',
    header: () => (
      <div className="text-left">Address</div>
    ),
    cell: ({ row }) => {
      const { street, cityMunicipality, province, zipCode } = row.original;
      // Note: cityMunicipality and province might be objects with a 'name' property
      // depending on the API response. Let's handle both cases.
      const cityName = typeof cityMunicipality === 'object' ? cityMunicipality?.name : cityMunicipality;
      const provinceName = typeof province === 'object' ? province?.name : province;

      return (
        <div className="text-left">
          {`${street || ''}, ${cityName || ''}, ${provinceName || ''} ${zipCode || ''}`}
        </div>
      );
    },
  },
  {
    id: 'location',
    header: () => (
      <div className="text-center">Location (Lat, Lon)</div>
    ),
    cell: ({ row }) => {
      const { latitude, longitude } = row.original;
      const content = latitude && longitude 
        ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        : 'N/A';
      return (
        <div className="text-center font-mono text-sm">{content}</div>
      );
    }
  },
  {
    accessorKey: 'isActive',
    header: () => (
      <div className="text-center">Status</div>
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive');
      return (
        <div className="text-center">
          <Badge variant={isActive ? 'default' : 'destructive'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: () => (
      <div className="text-left">Date Added</div>
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt');
      if (!date) return <div className="text-left">N/A</div>;
      const formattedDate = new Date(date as string).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      return <div className="text-left">{formattedDate}</div>;
    },
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right">Actions</div>
    ),
    cell: ({ row }) => {
      const clinic = row.original;
      return (
        <div className="text-right">
          <CellActions clinic={clinic} onEdit={onEdit} onDelete={onDelete} />
        </div>
      );
    },
  },
]; 