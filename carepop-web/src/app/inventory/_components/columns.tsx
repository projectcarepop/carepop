"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

// This is the updated, single source of truth for the InventoryItem type in the UI
export type InventoryItem = {
  id: string;
  clinicId: string;
  itemName: string;
  productCategoryId: string;
  sku?: string | null;
  genericName?: string | null;
  brandName?: string | null;
  dosageForm?: string | null;
  strength?: string | null;
  quantityInStock: number;
  reorderLevel: number;
  purchasePrice?: number | null;
  sellingPrice?: number | null;
  location?: string | null;
  description?: string | null;
  updatedAt: string;
};

export type InventoryItemBatch = {
  id: string;
  inventoryItemId: string;
  batchNumber?: string | null;
  quantity: number;
  expiryDate: string; // ISO String
  createdAt: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  description?: string | null;
};

type ColumnsProps = {
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onViewBatches: (item: InventoryItem) => void;
}

export const columns = ({ onEdit, onDelete, onViewBatches }: ColumnsProps): ColumnDef<InventoryItem, unknown>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "itemName",
    header: "Product Name",
  },
  {
    accessorKey: "brandName",
    header: "Brand",
  },
  {
    accessorKey: "strength",
    header: "Strength",
  },
  {
    accessorKey: "quantityInStock",
    header: "Quantity",
  },
  {
    accessorKey: "sellingPrice",
    header: "Price (PHP)",
    cell: ({ row }) => {
      const price = row.original.sellingPrice ?? 0;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(price)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => {
      const date = row.original.updatedAt;
      return date ? new Date(date).toLocaleDateString() : "N/A"
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original

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
              Edit Item
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewBatches(item)}>
              View Batches
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(item)}
            >
              Delete Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 