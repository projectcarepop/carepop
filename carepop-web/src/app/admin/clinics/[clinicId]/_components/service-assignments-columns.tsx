'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

type ServiceWithAssignments = {
  id: string;
  name: string;
  description?: string;
  assignedDoctors?: { id: string; fullName: string }[];
};

interface ColumnActions {
  onManageDoctors: (service: ServiceWithAssignments) => void;
  onRemoveService: (service: ServiceWithAssignments) => void;
}

export const serviceAssignmentsColumns = ({ 
  onManageDoctors, 
  onRemoveService 
}: ColumnActions): ColumnDef<ServiceWithAssignments>[] => [
  {
    accessorKey: 'name',
    header: 'Service Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      return description?.length > 50 ? `${description.substring(0, 50)}...` : description || 'N/A';
    }
  },
  {
    id: 'assignedDoctors',
    header: 'Assigned Doctors',
    cell: ({ row }) => {
      const doctors = row.original.assignedDoctors || [];
      return (
        <div className="flex flex-wrap gap-1">
          {doctors.length > 0 ? (
            doctors.slice(0, 2).map((doctor) => (
              <Badge key={doctor.id} variant="secondary" className="text-xs">
                {doctor.fullName}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">No doctors assigned</span>
          )}
          {doctors.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{doctors.length - 2} more
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const service = row.original;

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
            <DropdownMenuItem onClick={() => onManageDoctors(service)}>
              Manage Doctors
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onRemoveService(service)}
              className="text-red-600"
            >
              Remove from Clinic
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 