'use client';

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ClinicOverride } from "@/services/api";

type GetColumnsOptions = {
    onEdit: (override: ClinicOverride) => void;
    onDelete: (overrideId: string) => void;
}

export const columns = ({ onEdit, onDelete }: GetColumnsOptions): ColumnDef<ClinicOverride>[] => [
    {
        accessorKey: "reason",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Reason
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "startDateTime",
        header: "Start Date & Time",
        cell: ({ row }) => format(new Date(row.original.startDateTime), "Pp"),
    },
    {
        accessorKey: "endDateTime",
        header: "End Date & Time",
        cell: ({ row }) => format(new Date(row.original.endDateTime), "Pp"),
    },
    {
        accessorKey: "isAvailable",
        header: "Status",
        cell: ({ row }) => {
            const isAvailable = row.getValue("isAvailable");
            return <Badge variant={isAvailable ? "default" : "destructive"}>{isAvailable ? "Available" : "Unavailable"}</Badge>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const override = row.original;
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
                        <DropdownMenuItem onClick={() => onEdit(override)}>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(override.id)}
                            className="text-destructive"
                        >
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
]; 