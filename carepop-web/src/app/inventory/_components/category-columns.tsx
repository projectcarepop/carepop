'use client';

// Re-saving to try and fix module resolution issues
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type ProductCategory } from '@/lib/types/inventory';

type CategoryColumnsProps = {
  openSheet: (mode: 'editCategory', category: ProductCategory) => void;
  onDelete: (category: ProductCategory) => void;
};

export const categoryColumns = ({ openSheet, onDelete }: CategoryColumnsProps): ColumnDef<ProductCategory>[] => [
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
      const description = row.original.description;
      return (
        <div className="text-left">
          {description ? description : <span className="text-muted-foreground">N/A</span>}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: () => (
      <div className="text-right">Actions</div>
    ),
    cell: ({ row }) => {
      const category = row.original;

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
              <DropdownMenuItem onClick={() => openSheet('editCategory', category)}>
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(category)}
              >
                Delete Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
]; 