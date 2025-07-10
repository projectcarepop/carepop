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
    header: () => (
      <div className="text-left">Name</div>
    ),
    cell: ({ row }) => (
      <div className="text-left font-medium">{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'description',
    header: () => (
      <div className="text-left">Description</div>
    ),
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      const truncated = description?.length > 50 ? `${description.substring(0, 50)}...` : description;
      return (
        <div className="text-left">{truncated}</div>
      );
    }
  },
  {
      accessorKey: 'serviceCategory.name',
      header: () => (
        <div className="text-left">Category</div>
      ),
      cell: ({ row }) => {
          const category = row.original.serviceCategory;
          return (
            <div className="text-left">
              {category ? <Badge variant="outline">{category.name}</Badge> : 'N/A'}
            </div>
          );
      }
  },
  {
    accessorKey: 'price',
    header: () => (
      <div className="text-right">Price</div>
    ),
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
    header: () => (
      <div className="text-right">Actions</div>
    ),
    cell: ({ row }) => {
      const service = row.original;

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
        </div>
      );
    },
  },
]; 