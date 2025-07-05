'use client';

import { type ColumnDef, type Row } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
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
}

export const productColumns = ({ onEdit, onDelete, onUpdateStock }: ProductColumnsProps): ColumnDef<InventoryItem>[] => [
  {
    accessorKey: 'itemName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Product Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'brandName',
    header: 'Brand',
    cell: ({ row }) => row.original.brandName ?? <span className="text-muted-foreground">N/A</span>
  },
  {
    accessorKey: 'categoryName',
    header: 'Category',
    cell: ({ row }) => {
        return row.original.categoryName ?? 'N/A'
    }
  },
  {
    accessorKey: 'strength',
    header: 'Strength',
    cell: ({ row }) => row.original.strength ?? <span className="text-muted-foreground">N/A</span>
  },
  {
    accessorKey: 'dosageForm',
    header: 'Form',
    cell: ({ row }) => row.original.dosageForm ?? <span className="text-muted-foreground">N/A</span>
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
  },
  {
    accessorKey: 'quantityOnHand',
    header: ({ column }) => (
        <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
        Qty on Hand
        <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
  },
  {
    accessorKey: 'reorderLevel',
    header: 'Reorder Lvl',
    cell: ({ row }: { row: Row<InventoryItem> }) => <>{row.original.reorderLevel}</>
  },
  {
    accessorKey: 'sellingPrice',
    header: 'Selling Price',
    cell: ({ row }) => {
      const price = row.original.sellingPrice;
      if (price === null || price === undefined) return <span className="text-muted-foreground">N/A</span>;
      const amount = parseFloat(price);
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'PHP',
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'batchNumber',
    header: 'Batch No.',
  },
  {
    accessorKey: 'expiryDate',
    header: ({ column }) => (
        <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
        Expiry Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => {
      const date = row.original.expiryDate;
      return date ? new Date(date).toLocaleDateString() : 'N/A';
    },
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }) => row.original.location ?? <span className="text-muted-foreground">N/A</span>
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
        <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
        Last Updated
        <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
    cell: ({ row }) => {
        return new Date(row.original.updatedAt).toLocaleString();
    }
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
            <DropdownMenuItem onClick={() => onEdit(item)}>
              Edit Details
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