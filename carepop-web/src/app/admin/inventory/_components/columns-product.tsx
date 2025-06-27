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
import { AdminProduct } from '@/lib/types';

interface ColumnActions {
  onEdit: (product: AdminProduct) => void;
  onDelete: (id: string) => void;
  // onUpdateStock: (product: AdminProduct) => void; // For future implementation
}

export const columns = ({ onEdit, onDelete }: ColumnActions): ColumnDef<AdminProduct>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'categoryName',
    header: 'Category',
    cell: ({ row }) => <Badge variant="outline">{row.getValue('categoryName')}</Badge>,
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
    accessorKey: 'quantityOnHand',
    header: 'Stock',
    cell: ({ row }) => {
        const stock = row.getValue('quantityOnHand') as number;
        return <Badge variant={stock > 0 ? 'default' : 'destructive'}>{stock}</Badge>
    }
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive');
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Archived'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const product = row.original;

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
            <DropdownMenuItem onClick={() => onEdit(product)}>
              Edit Product
            </DropdownMenuItem>
            {/* <DropdownMenuItem>Update Stock</DropdownMenuItem> */}
            <DropdownMenuItem
              onClick={() => onDelete(product.id)}
              className="text-red-600"
            >
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 