'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { apiClient } from '@/lib/apiClient';
import { useToast } from "@/components/ui/use-toast";

import { columns, Doctor } from './columns';
import { DoctorForm } from './DoctorForm';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DoctorsClientProps {
    initialData: Doctor[];
}

// Define a more complete Doctor type for mutations, including relations
type DoctorWithRelations = Doctor & { clinicIds: string[], serviceIds: string[] };

export function DoctorsClient({ initialData }: DoctorsClientProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithRelations | null>(null);

    // --- Data Fetching ---
    const { data: doctors = [] } = useQuery<Doctor[]>({
        queryKey: ['adminDoctors'],
        queryFn: async () => {
            const res = await apiClient.api.admin.doctors.$get();
            if (!res.ok) throw new Error('Failed to fetch doctors');
            const data = await res.json();
            return data.data;
        },
        initialData: initialData,
    });

    // --- Mutations ---
    const createDoctorMutation = useMutation({
        mutationFn: (newDoctor: Omit<DoctorWithRelations, 'id' | 'isActive'>) => apiClient.api.admin.doctors.$post({ json: newDoctor }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminDoctors'] });
            toast({ title: 'Doctor created successfully' });
            setIsModalOpen(false);
        },
        onError: (error) => toast({ title: 'Error creating doctor', description: error.message, variant: 'destructive' }),
    });

    const updateDoctorMutation = useMutation({
        mutationFn: (updatedDoctor: DoctorWithRelations) => apiClient.api.admin.doctors[updatedDoctor.id].$put({ json: updatedDoctor }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminDoctors'] });
            toast({ title: 'Doctor updated successfully' });
            setIsModalOpen(false);
            setSelectedDoctor(null);
        },
        onError: (error) => toast({ title: 'Error updating doctor', description: error.message, variant: 'destructive' }),
    });

    // --- Table Definition ---
    const table = useReactTable({
        data: doctors,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    // --- Event Handlers ---
    const handleAddNew = () => {
        setSelectedDoctor(null);
        setIsModalOpen(true);
    };

    const handleFormSubmit = (values: Omit<DoctorWithRelations, 'id' | 'isActive'>) => {
        if (selectedDoctor) {
            updateDoctorMutation.mutate({ ...selectedDoctor, ...values });
        } else {
            createDoctorMutation.mutate(values);
        }
    };

    return (
        <div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <Button onClick={handleAddNew}>Create New Doctor</Button>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{selectedDoctor ? 'Edit Doctor' : 'Create New Doctor'}</DialogTitle>
                    </DialogHeader>
                    {/* The form needs to be inside the content to be rendered */}
                    <DoctorForm 
                        initialData={selectedDoctor}
                        onSubmit={handleFormSubmit}
                        isPending={createDoctorMutation.isPending || updateDoctorMutation.isPending}
                    />
                </DialogContent>
            </Dialog>

            <div className="rounded-md border mt-4">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(hg => (
                            <TableRow key={hg.id}>
                                {hg.headers.map(h => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 