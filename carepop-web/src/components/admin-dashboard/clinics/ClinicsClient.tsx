'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {  
    flexRender, 
    getCoreRowModel, 
    useReactTable,
    getSortedRowModel,
    SortingState,
} from "@tanstack/react-table";

import { apiClient } from '@/lib/apiClient';
import { useToast } from "@/hooks/use-toast";
import { columns, Clinic } from './columns';
import { ClinicForm } from './ClinicForm';

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
        queryFn: async () => {
            const res = await apiClient.api.admin.clinics.$get();
            if (!res.ok) throw new Error('Failed to fetch clinics');
            const data = await res.json();
            return data.data;
        },
        initialData: initialData,
    });

    // --- Mutations ---
    const createClinicMutation = useMutation({
        mutationFn: (newClinic: Omit<Clinic, 'id'>) => apiClient.api.admin.clinics.$post({ json: newClinic }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
            toast({ title: 'Clinic created successfully' });
            setIsModalOpen(false);
        },
        onError: (error) => toast({ title: 'Error creating clinic', description: error.message, variant: 'destructive' }),
    });

    const updateClinicMutation = useMutation({
        mutationFn: (updatedClinic: Clinic) => apiClient.api.admin.clinics[updatedClinic.id].$put({ json: updatedClinic }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
            toast({ title: 'Clinic updated successfully' });
            setIsModalOpen(false);
            setSelectedClinic(null);
        },
        onError: (error) => toast({ title: 'Error updating clinic', description: error.message, variant: 'destructive' }),
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
    });

    // --- Event Handlers ---
    const handleAddNew = () => {
        setSelectedClinic(null);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (values: Omit<Clinic, 'id'>) => {
        if (selectedClinic) {
            updateClinicMutation.mutate({ ...selectedClinic, ...values });
        } else {
            createClinicMutation.mutate(values);
        }
    };

    return (
        <div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
                        isPending={createClinicMutation.isPending || updateClinicMutation.isPending}
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