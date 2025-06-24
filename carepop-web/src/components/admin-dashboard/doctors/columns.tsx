'use client';

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// TODO: Centralize this type
export type Doctor = {
  id: string;
  fullName: string;
  specialty: string;
  isActive: boolean;
};

export const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "specialty",
    header: "Specialty",
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
    cell: ({ row }) => {
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
            <DropdownMenuItem>Edit Doctor</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Deactivate Doctor
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 