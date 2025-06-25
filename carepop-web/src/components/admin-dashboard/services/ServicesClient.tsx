'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import { getAdminServices, upsertService, getAdminServiceCategories, upsertServiceCategory } from '@/services/api';

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { type ServiceCategory } from '@/lib/types';
import { serviceColumns, categoryColumns, type ServiceWithCategory } from './columns';
import { ServiceForm } from './ServiceForm';
import { CategoryForm } from './CategoryForm';

type ModalState = {
    isOpen: boolean;
    type: 'service' | 'category';
    data?: ServiceWithCategory | ServiceCategory | null;
};

function DataTable<TData, TValue>({ columns, data }: { columns: ColumnDef<TData, TValue>[], data: TData[] }) {
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
    return (
        <div className="rounded-md border mt-4">
            <Table>
                <TableHeader>{table.getHeaderGroups().map(hg => (<TableRow key={hg.id}>{hg.headers.map(h => (<TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (table.getRowModel().rows.map(row => (<TableRow key={row.id}>{row.getVisibleCells().map(cell => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))) : (<TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell></TableRow>)}
                </TableBody>
            </Table>
        </div>
    );
}

export function ServicesClient({ initialServices, initialCategories }: { initialServices: ServiceWithCategory[], initialCategories: ServiceCategory[] }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [modalState, setModalState] = useState<ModalState | { isOpen: false, type: null, data: null }>({ isOpen: false, type: null, data: null });
    const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');

    const { data: services = [] } = useQuery<ServiceWithCategory[]>({
        queryKey: ['adminServices'],
        queryFn: getAdminServices,
        initialData: initialServices,
    });
    const { data: categories = [] } = useQuery<ServiceCategory[]>({
        queryKey: ['adminServiceCategories'],
        queryFn: getAdminServiceCategories,
        initialData: initialCategories,
    });
    
    const serviceMutation = useMutation({
        mutationFn: (values: any) => upsertService(values, modalState.data?.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminServices'] });
            toast({ title: `Service ${modalState.data ? 'updated' : 'created'}` });
            setModalState({ isOpen: false, type: null, data: null });
        },
        onError: (err: Error) => toast({ title: "Service operation failed", description: err.message, variant: 'destructive' })
    });

    const categoryMutation = useMutation({
        mutationFn: (values: any) => upsertServiceCategory(values, modalState.data?.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminServiceCategories'] });
            toast({ title: `Category ${modalState.data ? 'updated' : 'created'}` });
            setModalState({ isOpen: false, type: null, data: null });
        },
        onError: (err: Error) => toast({ title: "Category operation failed", description: err.message, variant: 'destructive' })
    });

    const isSubmitting = serviceMutation.isPending || categoryMutation.isPending;
    
    const openModal = (type: 'service' | 'category', data: ServiceWithCategory | ServiceCategory | null = null) => {
        setModalState({ isOpen: true, type, data });
    };

    return (
        <>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'services' | 'categories')}>
                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="services">Services</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                    </TabsList>
                    <Button onClick={() => openModal(activeTab === 'services' ? 'service' : 'category')}> 
                        <PlusCircle className="mr-2 h-4 w-4" /> Add {activeTab === 'services' ? 'Service' : 'Category'}
                    </Button>
                </div>
                <TabsContent value="services"><DataTable columns={serviceColumns} data={services} /></TabsContent>
                <TabsContent value="categories"><DataTable columns={categoryColumns} data={categories} /></TabsContent>
            </Tabs>

            <Dialog open={modalState.isOpen} onOpenChange={(isOpen) => !isOpen && setModalState({ isOpen: false, type: null, data: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{modalState.isOpen && modalState.data ? 'Edit' : 'Create'} {modalState.isOpen && modalState.type === 'service' ? 'Service' : 'Category'}</DialogTitle>
                    </DialogHeader>
                    {modalState.isOpen && modalState.type === 'service' && <ServiceForm initialData={modalState.data as ServiceWithCategory} categories={categories} onSubmit={(values) => serviceMutation.mutate(values)} isSubmitting={isSubmitting} />}
                    {modalState.isOpen && modalState.type === 'category' && <CategoryForm initialData={modalState.data as ServiceCategory} onSubmit={(values) => categoryMutation.mutate(values)} isSubmitting={isSubmitting} />}
                </DialogContent>
            </Dialog>
        </>
    );
} 