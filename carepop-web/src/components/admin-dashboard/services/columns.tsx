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
import { type Service, type ServiceCategory } from "@/lib/types";

// Note: We need a specific type for the services table that includes categoryName
export type ServiceWithCategory = Service & { categoryName: string };

// --- Services Columns ---
export const serviceColumns: ColumnDef<ServiceWithCategory>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'categoryName', header: 'Category' },
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