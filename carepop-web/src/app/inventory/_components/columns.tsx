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
  onManageBatches: (item: InventoryItem) => void;
}

export const productColumns = ({ onEdit, onDelete, onUpdateStock, onViewDetails, onManageBatches }: ProductColumnsProps): ColumnDef<InventoryItem>[] => [
  {
    accessorKey: 'itemName',
    header: () => (
      <div className="text-left">Name</div>
    ),
    cell: ({ row }) => (
      <div className="text-left font-medium">{row.original.itemName}</div>
    ),
  },
  {
    accessorKey: 'categoryName',
    header: () => (
      <div className="text-left">Category</div>
    ),
    cell: ({ row }) => (
      <div className="text-left">{row.original.categoryName ?? 'N/A'}</div>
    ),
  },
  {
    accessorKey: 'brandName',
    header: () => (
      <div className="text-left">Brand</div>
    ),
    cell: ({ row }) => (
      <div className="text-left">{row.original.brandName}</div>
    ),
  },
  {
    accessorKey: 'strength',
    header: () => (
      <div className="text-left">Strength</div>
    ),
    cell: ({ row }) => (
      <div className="text-left">{row.original.strength}</div>
    ),
  },
  {
    accessorKey: 'dosageForm',
    header: () => (
      <div className="text-left">Form</div>
    ),
    cell: ({ row }) => (
      <div className="text-left">{row.original.dosageForm}</div>
    ),
  },
  {
    accessorKey: 'quantityOnHand',
    header: () => (
      <div className="text-right">Qty on Hand</div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">{row.original.quantityOnHand}</div>
    ),
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right">Actions</div>
    ),
    cell: ({ row }) => {
      const item = row.original;

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
              <DropdownMenuItem onClick={() => onViewDetails(item)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdateStock(item)}>
                  Update Stock
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageBatches(item)}>
                  Manage Batches
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
        </div>
      );
    },
  },
];

// Keep the category columns as they are, since they are not the focus.
export { categoryColumns } from './category-columns';