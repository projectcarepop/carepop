'use client';

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AdminAppointment } from "@/lib/types";
import Link from "next/link";

type GetColumnsOptions = {
    onCancel: (appointmentId: string) => void;
}

export const columns = ({ onCancel }: GetColumnsOptions): ColumnDef<AdminAppointment>[] => [
    {
        accessorKey: "patientName",
        header: "Patient",
    },
    {
        accessorKey: "doctorName",
        header: "Doctor",
    },
    {
        accessorKey: "clinicName",
        header: "Clinic",
    },
    {
        accessorKey: "appointmentTime",
        header: "Date & Time",
        cell: ({ row }) => format(new Date(row.original.appointmentTime), "Pp"),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            return <Badge>{row.original.status}</Badge>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const appointment = row.original;
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
                        <DropdownMenuItem asChild>
                           <Link href={`/admin/appointments/${appointment.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        {appointment.status === 'scheduled' && (
                            <DropdownMenuItem
                                onClick={() => onCancel(appointment.id)}
                                className="text-destructive"
                            >
                                Cancel Appointment
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
]; 