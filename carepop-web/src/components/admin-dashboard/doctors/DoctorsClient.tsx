'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {  
    flexRender, 
    getCoreRowModel, 
    useReactTable,
    getSortedRowModel,
    type SortingState,
} from "@tanstack/react-table";

import { useToast } from "@/hooks/use-toast";
import { getAdminDoctors, upsertDoctor } from '@/services/api';
import { type Doctor } from "@/lib/types";
import { columns } from './columns';
import { DoctorForm } from './DoctorForm'; 

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface DoctorsClientProps {
    initialData: Doctor[];
}

export function DoctorsClient({ initialData }: DoctorsClientProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    // --- Data Fetching ---
    const { data: doctors = [] } = useQuery<Doctor[]>({
        queryKey: ['adminDoctors'],
        queryFn: getAdminDoctors,
        initialData: initialData,
    });

    // --- Mutations ---
    const doctorMutation = useMutation({
        mutationFn: (doctorData: any) => upsertDoctor(doctorData, selectedDoctor?.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminDoctors'] });
            const action = selectedDoctor ? 'updated' : 'created';
            toast({ title: `Doctor ${action} successfully` });
            setIsModalOpen(false);
        },
        onError: (error: Error) => {
            const action = selectedDoctor ? 'updating' : 'creating';
            toast({ title: `Error ${action} doctor`, description: error.message, variant: 'destructive' });
        },
    });

    // --- Table Definition ---
    const table = useReactTable({
        data: doctors,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
          sorting,
        },
        meta: {
            editDoctor: (doctor: Doctor) => {
                setSelectedDoctor(doctor);
                setIsModalOpen(true);
            }
        }
    });

    // --- Event Handlers ---
    const handleAddNew = () => {
        setSelectedDoctor(null);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (values: any) => {
        doctorMutation.mutate(values);
    };

    const handleModalChange = (isOpen: boolean) => {
        if (!isOpen) {
            setSelectedDoctor(null);
        }
        setIsModalOpen(isOpen);
    }

    return (
        <div>
            <Dialog open={isModalOpen} onOpenChange={handleModalChange}>
                <Button onClick={handleAddNew}>Create New Doctor</Button>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                    <DialogTitle>{selectedDoctor ? 'Edit Doctor' : 'Create New Doctor'}</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the doctor&apos;s profile.  
                    </DialogDescription>
                    </DialogHeader>
                    <DoctorForm 
                        initialData={selectedDoctor}
                        onSubmit={handleFormSubmit}
                        isPending={doctorMutation.isPending}
                    />
                </DialogContent>
            </Dialog>

            <div className="rounded-md border mt-4">
                <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                        {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </TableHead>
                        ))}
                    </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        >
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                        No results.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
        </div>
    );
} 