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
import { getAdminClinics, upsertClinic } from '@/services/api';
import { type Clinic } from "@/lib/types";
import { columns } from './columns';
import { ClinicForm, type ClinicFormData } from './ClinicForm';

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
  

interface ClinicsClientProps {
    initialData: Clinic[];
}

export function ClinicsClient({ initialData }: ClinicsClientProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

    // --- Data Fetching ---
    const { data: clinics = [] } = useQuery<Clinic[]>({
        queryKey: ['adminClinics'],
        queryFn: getAdminClinics,
        initialData: initialData,
    });

    // --- Mutations ---
    const clinicMutation = useMutation({
        mutationFn: (clinicData: ClinicFormData) => upsertClinic(clinicData, selectedClinic?.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
            const action = selectedClinic ? 'updated' : 'created';
            toast({ title: `Clinic ${action} successfully` });
            setIsModalOpen(false);
        },
        onError: (error: Error) => {
            const action = selectedClinic ? 'updating' : 'creating';
            toast({ title: `Error ${action} clinic`, description: error.message, variant: 'destructive' });
        },
    });

    // --- Table Definition ---
    const table = useReactTable({
        data: clinics,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
          sorting,
        },
        meta: {
            editClinic: (clinic: Clinic) => {
                setSelectedClinic(clinic);
                setIsModalOpen(true);
            }
        }
    });

    // --- Event Handlers ---
    const handleAddNew = () => {
        setSelectedClinic(null);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (values: ClinicFormData) => {
        clinicMutation.mutate(values);
    };

    const handleModalChange = (isOpen: boolean) => {
        if (!isOpen) {
            setSelectedClinic(null);
        }
        setIsModalOpen(isOpen);
    }

    return (
        <div>
            <Dialog open={isModalOpen} onOpenChange={handleModalChange}>
                <Button onClick={handleAddNew}>Create New Clinic</Button>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>{selectedClinic ? 'Edit Clinic' : 'Create New Clinic'}</DialogTitle>
                    <DialogDescription>
                        Fill in the details below. Click save when you&apos;re done.
                    </DialogDescription>
                    </DialogHeader>
                    <ClinicForm 
                        initialData={selectedClinic}
                        onSubmit={handleFormSubmit}
                        isPending={clinicMutation.isPending}
                    />
                </DialogContent>
            </Dialog>

            <div className="rounded-md border mt-4">
                <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                        return (
                            <TableHead key={header.id}>
                            {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                            </TableHead>
                        );
                        })}
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