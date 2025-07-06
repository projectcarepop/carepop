'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { type InventoryItem } from '@/lib/types/inventory';
import { Badge } from '@/components/ui/badge';

export const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: 'itemName',
    header: 'Product Name',
    cell: ({ row }) => {
      return <span className="font-medium">{row.original.itemName}</span>;
    },
  },
  {
    accessorKey: 'categoryName',
    header: 'Category',
    cell: ({ row }) => {
        return row.original.categoryName ? <Badge variant="outline">{row.original.categoryName}</Badge> : 'N/A';
    }
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
    cell: ({ row }) => {
      const { quantityOnHand, reorderLevel } = row.original;
      const isLowStock = quantityOnHand !== null && reorderLevel !== null && quantityOnHand <= reorderLevel;
      return (
        <div className="flex items-center">
          <span className={isLowStock ? 'text-red-500 font-bold' : ''}>{quantityOnHand ?? 0}</span>
          {isLowStock && <Badge variant="destructive" className="ml-2">Low</Badge>}
        </div>
      );
    },
  },
];

// Keep the category columns as they are, since they are not the focus.
export { categoryColumns } from './category-columns';