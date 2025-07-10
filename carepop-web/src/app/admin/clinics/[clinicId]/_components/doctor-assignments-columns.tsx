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

type DoctorWithAssignments = {
  id: string;
  fullName: string;
  specialization?: string;
  assignedServices?: { id: string; name: string }[];
};

interface ColumnActions {
  onManageServices: (doctor: DoctorWithAssignments) => void;
  onRemoveDoctor: (doctor: DoctorWithAssignments) => void;
}

export const doctorAssignmentsColumns = ({ 
  onManageServices, 
  onRemoveDoctor 
}: ColumnActions): ColumnDef<DoctorWithAssignments>[] => [
  {
    accessorKey: 'fullName',
    header: 'Doctor Name',
  },
  {
    accessorKey: 'specialization',
    header: 'Specialization',
    cell: ({ row }) => {
      const specialization = row.getValue('specialization') as string;
      return specialization || 'N/A';
    }
  },
  {
    id: 'assignedServices',
    header: 'Assigned Services',
    cell: ({ row }) => {
      const services = row.original.assignedServices || [];
      return (
        <div className="flex flex-wrap gap-1">
          {services.length > 0 ? (
            services.slice(0, 2).map((service) => (
              <Badge key={service.id} variant="secondary" className="text-xs">
                {service.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">No services assigned</span>
          )}
          {services.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{services.length - 2} more
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const doctor = row.original;

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
            <DropdownMenuItem onClick={() => onManageServices(doctor)}>
              Manage Services
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onRemoveDoctor(doctor)}
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