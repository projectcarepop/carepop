'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type InventoryItem } from '@/lib/types/inventory';

interface ProductColumnsProps {
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onUpdateStock: (item: InventoryItem) => void;
  onViewDetails: (item: InventoryItem) => void;
}

export const productColumns = ({ onEdit, onDelete, onUpdateStock, onViewDetails }: ProductColumnsProps): ColumnDef<InventoryItem>[] => [
  {
    accessorKey: 'itemName',
    header: 'Name',
  },
  {
    accessorKey: 'categoryName',
    header: 'Category',
    cell: ({ row }) => row.original.categoryName ?? 'N/A'
  },
  {
    accessorKey: 'brandName',
    header: 'Brand',
  },
  {
    accessorKey: 'strength',
    header: 'Strength',
  },
  {
    accessorKey: 'dosageForm',
    header: 'Form',
  },
  {
    accessorKey: 'quantityOnHand',
    header: 'Qty on Hand',
  },
  {
    accessorKey: 'batchNumber',
    header: 'Batch No.',
    cell: ({ row }) => row.original.batchNumber ?? <span className="text-muted-foreground">N/A</span>,
  },
  {
    accessorKey: 'expiryDate',
    header: 'Expiry Date',
    cell: ({ row }) => {
      const date = row.original.expiryDate;
      return date ? new Date(date).toLocaleDateString() : 'N/A';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const item = row.original;

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
            <DropdownMenuItem onClick={() => onViewDetails(item)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(item)}>
              Edit Product
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStock(item)}>
                Update Stock
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(item)}
            >
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Keep the category columns as they are, since they are not the focus.
export { categoryColumns } from './category-columns';