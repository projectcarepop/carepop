"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { type InventoryItem, type ProductCategory } from "@/lib/types/inventory"
import { Badge } from "@/components/ui/badge"

// Props for the columns functions to accept handlers from the client component
interface ProductColumnsProps {
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onUpdateStock: (item: InventoryItem) => void;
}

interface CategoryColumnsProps {
  onEdit: (category: ProductCategory) => void;
  onDelete: (category: ProductCategory) => void;
}

export const productColumns = ({ onEdit, onDelete, onUpdateStock }: ProductColumnsProps): ColumnDef<InventoryItem>[] => [
  {
    accessorKey: "itemName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "categoryName",
    header: "Category",
  },
  {
    accessorKey: "quantityInStock",
    header: "Stock",
    cell: ({ row }) => <div className="text-center">{row.original.quantityInStock}</div>,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue("price"))
        const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(amount)
        return <div className="font-medium">{formatted}</div>
    }
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return <Badge variant={isActive ? "default" : "secondary"}>{isActive ? 'Active' : 'Archived'}</Badge>
    },
  },
  {
    id: "actions",
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
            <DropdownMenuItem onClick={() => onEdit(item)}>Edit Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStock(item)}>Update Stock</DropdownMenuItem>
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

export const categoryColumns = ({ onEdit, onDelete }: CategoryColumnsProps): ColumnDef<ProductCategory>[] => [
    {
      accessorKey: "name",
      header: "Category Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original
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
              <DropdownMenuItem onClick={() => onEdit(category)}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete(category)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
]; 