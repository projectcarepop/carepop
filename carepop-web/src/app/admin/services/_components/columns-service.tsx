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
import { type AdminService } from '@/lib/types';

interface ColumnActions {
  onEdit: (service: AdminService) => void;
  onDelete: (service: AdminService) => void;
}

export const columns = ({ onEdit, onDelete }: ColumnActions): ColumnDef<AdminService>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      return description?.length > 50 ? `${description.substring(0, 50)}...` : description;
    }
  },
  {
      accessorKey: 'serviceCategory.name',
      header: 'Category',
      cell: ({ row }) => {
          const category = row.original.serviceCategory;
          return category ? <Badge variant="outline">{category.name}</Badge> : 'N/A';
      }
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('price'));
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
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
            <DropdownMenuItem onClick={() => onEdit(service)}>
              Edit Service
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(service)}
              className="text-red-600"
            >
              Delete Service
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 