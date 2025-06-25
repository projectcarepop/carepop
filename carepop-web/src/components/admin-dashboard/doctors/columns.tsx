'use client';

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Doctor } from "@/lib/types";

// Extend the window interface for our table meta
declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    editDoctor: (doctor: TData) => void;
  }
}

export const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "specialization",
    header: "Specialization",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
        const isActive = row.getValue("isActive");
        return <Badge variant={isActive ? "default" : "outline"}>{isActive ? 'Active' : 'Inactive'}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const doctor = row.original;
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
            <DropdownMenuItem onClick={() => table.options.meta?.editDoctor?.(doctor)}>
              Edit Doctor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 