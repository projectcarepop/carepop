'use client';

import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Service as BaseService, type ServiceCategory } from "@/lib/types";

// The API now returns the category object nested inside the service object.
// We can define the type for our table data accordingly.
export type Service = BaseService & {
  serviceCategory: {
    name: string;
  } | null; // Handle services that might not have a category
};

// --- Services Columns ---
export const serviceColumns: ColumnDef<Service>[] = [
    { accessorKey: 'name', header: 'Name' },
    { 
      accessorKey: "serviceCategory.name",
      header: "Category",
      cell: ({ row }) => {
        const categoryName = row.original.serviceCategory?.name;
        return categoryName || <span className="text-muted-foreground">Uncategorized</span>;
      }
    },
    { accessorKey: 'price', header: 'Price (PHP)', cell: ({ row }) => `₱${row.original.price}` },
    { accessorKey: 'duration', header: 'Duration (min)' },
    { id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent><DropdownMenuItem onClick={() => console.log('edit service', row.original.id)}>Edit</DropdownMenuItem></DropdownMenuContent>
        </DropdownMenu>
    )},
];

// --- Categories Columns ---
export const categoryColumns: ColumnDef<ServiceCategory>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description' },
    { id: 'actions', cell: ({ row }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent><DropdownMenuItem onClick={() => console.log('edit category', row.original.id)}>Edit</DropdownMenuItem></DropdownMenuContent>
        </DropdownMenu>
    )},
]; 