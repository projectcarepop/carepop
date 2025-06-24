'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { apiClient } from '@/lib/apiClient';
import { useToast } from "@/components/ui/use-toast";

import { PlusCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { type Service, type ServiceCategory } from '@/types/app';
import { ServiceForm } from './ServiceForm';
import { CategoryForm } from './CategoryForm';

// --- Types ---
type ModalState = {
    isOpen: boolean;
    type: 'service' | 'category' | null;
    data?: Service | ServiceCategory | null;
};

// --- Helper: Data Table Component ---
function DataTable<TData, TValue>({ columns, data }: { columns: ColumnDef<TData, TValue>[], data: TData[] }) {
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>{table.getHeaderGroups().map(hg => (<TableRow key={hg.id}>{hg.headers.map(h => (<TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (table.getRowModel().rows.map(row => (<TableRow key={row.id}>{row.getVisibleCells().map(cell => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))) : (<TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell></TableRow>)}
                </TableBody>
            </Table>
        </div>
    );
}

// --- Main Client Component ---
export function ServicesClient({ initialServices, initialCategories }: { initialServices: Service[], initialCategories: ServiceCategory[] }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false, type: null, data: null });

    // --- Data Fetching ---
    const { data: services = [] } = useQuery<Service[]>({
        queryKey: ['adminServices'],
        queryFn: async () => (await apiClient.api.admin.services.$get()).json().then(res => res.data),
        initialData: initialServices,
    });
    const { data: categories = [] } = useQuery<ServiceCategory[]>({
        queryKey: ['adminServiceCategories'],
        queryFn: async () => (await apiClient.api.admin['service-categories'].$get()).json().then(res => res.data),
        initialData: initialCategories,
    });
    
    // --- Mutations ---
    const serviceMutation = useMutation({
        mutationFn: (values: any) => {
            const endpoint = modalState.data 
                ? apiClient.api.admin.services[modalState.data.id].$put({ json: values })
                : apiClient.api.admin.services.$post({ json: values });
            return endpoint;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminServices'] });
            toast({ title: `Service ${modalState.data ? 'updated' : 'created'}` });
            setModalState({ isOpen: false, type: null, data: null });
        },
        onError: (err) => toast({ title: "An error occurred", description: err.message, variant: 'destructive' })
    });

    const categoryMutation = useMutation({
         mutationFn: (values: any) => {
            const endpoint = modalState.data 
                ? apiClient.api.admin['service-categories'][modalState.data.id].$put({ json: values })
                : apiClient.api.admin['service-categories'].$post({ json: values });
            return endpoint;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminServiceCategories'] });
            toast({ title: `Category ${modalState.data ? 'updated' : 'created'}` });
            setModalState({ isOpen: false, type: null, data: null });
        },
        onError: (err) => toast({ title: "An error occurred", description: err.message, variant: 'destructive' })
    });

    // --- Column Definitions (Co-located) ---
    const serviceColumns: ColumnDef<Service>[] = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'categoryName', header: 'Category' },
        { accessorKey: 'price', header: 'Price (PHP)', cell: ({ row }) => `₱${row.original.price}` },
        { accessorKey: 'duration', header: 'Duration (min)' },
        { id: 'actions', cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent><DropdownMenuItem onClick={() => setModalState({ isOpen: true, type: 'service', data: row.original })}>Edit</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>
        )},
    ];
    const categoryColumns: ColumnDef<ServiceCategory>[] = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'description', header: 'Description' },
        { id: 'actions', cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent><DropdownMenuItem onClick={() => setModalState({ isOpen: true, type: 'category', data: row.original })}>Edit</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>
        )},
    ];

    const isSubmitting = serviceMutation.isPending || categoryMutation.isPending;

    return (
        <>
            <Tabs defaultValue="services">
                <div className="flex justify-between items-center">
                    <TabsList>
                        <TabsTrigger value="services">Services</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                    </TabsList>
                    <Button onClick={() => setModalState({ isOpen: true, type: 'service', data: null })}> <PlusCircle className="mr-2 h-4 w-4" /> Add Service </Button>
                     <Button onClick={() => setModalState({ isOpen: true, type: 'category', data: null })} variant="outline" className="ml-2"> <PlusCircle className="mr-2 h-4 w-4" /> Add Category </Button>
                </div>
                <TabsContent value="services"><DataTable columns={serviceColumns} data={services} /></TabsContent>
                <TabsContent value="categories"><DataTable columns={categoryColumns} data={categories} /></TabsContent>
            </Tabs>

            <Dialog open={modalState.isOpen} onOpenChange={(isOpen) => !isOpen && setModalState({ isOpen: false, type: null, data: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{modalState.data ? 'Edit' : 'Create'} {modalState.type === 'service' ? 'Service' : 'Category'}</DialogTitle>
                    </DialogHeader>
                    {modalState.type === 'service' && <ServiceForm initialData={modalState.data as Service} categories={categories} onSubmit={(values) => serviceMutation.mutate(values)} isSubmitting={isSubmitting} />}
                    {modalState.type === 'category' && <CategoryForm initialData={modalState.data as ServiceCategory} onSubmit={(values) => categoryMutation.mutate(values)} isSubmitting={isSubmitting} />}
                </DialogContent>
            </Dialog>
        </>
    );
} 