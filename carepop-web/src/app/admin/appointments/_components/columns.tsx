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
        header: () => (
            <div className="text-left">Patient</div>
        ),
        cell: ({ row }) => (
            <div className="text-left">{row.original.patientName}</div>
        ),
    },
    {
        accessorKey: "doctorName",
        header: () => (
            <div className="text-left">Doctor</div>
        ),
        cell: ({ row }) => (
            <div className="text-left">{row.original.doctorName}</div>
        ),
    },
    {
        accessorKey: "clinicName",
        header: () => (
            <div className="text-left">Clinic</div>
        ),
        cell: ({ row }) => (
            <div className="text-left">{row.original.clinicName}</div>
        ),
    },
    {
        accessorKey: "appointmentTime",
        header: () => (
            <div className="text-left">Date & Time</div>
        ),
        cell: ({ row }) => (
            <div className="text-left">{format(new Date(row.original.appointmentTime), "Pp")}</div>
        ),
    },
    {
        accessorKey: "status",
        header: () => (
            <div className="text-center">Status</div>
        ),
        cell: ({ row }) => (
            <div className="text-center">
                <Badge>{row.original.status}</Badge>
            </div>
        ),
    },
    {
        id: "actions",
        header: () => (
            <div className="text-right">Actions</div>
        ),
        cell: ({ row }) => {
            const appointment = row.original;
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
                </div>
            );
        },
    },
]; 