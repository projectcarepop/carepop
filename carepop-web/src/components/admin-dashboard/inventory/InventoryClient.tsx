'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { useToast } from '@/hooks/use-toast';
import { 
    getAdminProducts, 
    getAdminProductCategories, 
    upsertProduct, 
    upsertProductCategory, 
    updateStock 
} from '@/services/api';

import { PlusCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { type ProductCategory, type ProductWithStockAndCategory as Product } from '@/lib/types';
import { ProductForm } from './ProductForm';
import { CategoryForm } from './CategoryForm';
import { UpdateStockForm } from './UpdateStockForm';

// --- Types ---
type ModalType = 'product' | 'category' | 'stock';
type ModalState = {
    isOpen: boolean;
    type: ModalType | null;
    data?: Product | ProductCategory | null;
};

// --- Helper: Data Table Component ---
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

// --- Main Client Component ---
export function InventoryClient({ initialProducts, initialCategories }: { initialProducts: Product[], initialCategories: ProductCategory[] }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false, type: null, data: null });
    const [activeTab, setActiveTab] = useState('products');

    // --- Data Fetching ---
    const { data: products = [] } = useQuery<Product[]>({
        queryKey: ['adminProducts'],
        queryFn: getAdminProducts,
        initialData: initialProducts,
    });
    const { data: categories = [] } = useQuery<ProductCategory[]>({
        queryKey: ['adminProductCategories'],
        queryFn: getAdminProductCategories,
        initialData: initialCategories,
    });
    
    // --- Mutations ---
    const productMutation = useMutation({
        mutationFn: (values: any) => upsertProduct(values, (modalState.data as Product)?.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
            toast({ title: `Product ${modalState.data ? 'updated' : 'created'}` });
            setModalState({ isOpen: false, type: null, data: null });
        },
        onError: (err: Error) => toast({ title: "Product operation failed", description: err.message, variant: 'destructive' })
    });

    const categoryMutation = useMutation({
         mutationFn: (values: any) => upsertProductCategory(values, (modalState.data as ProductCategory)?.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProductCategories'] });
            toast({ title: `Category ${modalState.data ? 'updated' : 'created'}` });
            setModalState({ isOpen: false, type: null, data: null });
        },
        onError: (err: Error) => toast({ title: "Category operation failed", description: err.message, variant: 'destructive' })
    });

     const stockMutation = useMutation({
        mutationFn: ({ productId, quantity }: { productId: string, quantity: number }) => updateStock(productId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
            toast({ title: "Stock updated successfully" });
            setModalState({ isOpen: false, type: null, data: null });
        },
        onError: (err: Error) => toast({ title: "Stock update failed", description: err.message, variant: 'destructive' })
    });

    const isSubmitting = productMutation.isPending || categoryMutation.isPending || stockMutation.isPending;

    // --- Column Definitions ---
    const productColumns: ColumnDef<Product>[] = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'categoryName', header: 'Category' },
        { accessorKey: 'price', header: 'Price (PHP)', cell: ({ row }) => `₱${row.original.price}` },
        { accessorKey: 'quantityOnHand', header: 'Stock', cell: ({ row }) => {
            const stock = row.original.quantityOnHand ?? 0;
            return <Badge variant={stock > 0 ? 'default' : 'destructive'}>{stock}</Badge>
        }},
        { id: 'actions', cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setModalState({ isOpen: true, type: 'product', data: row.original })}>Edit Product</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setModalState({ isOpen: true, type: 'stock', data: row.original })}>Update Stock</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )},
    ];
    const categoryColumns: ColumnDef<ProductCategory>[] = [
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'description', header: 'Description' },
        { id: 'actions', cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent><DropdownMenuItem onClick={() => setModalState({ isOpen: true, type: 'category', data: row.original })}>Edit</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>
        )},
    ];

    const openCreateModal = () => {
        const type = activeTab === 'products' ? 'product' : 'category';
        setModalState({ isOpen: true, type, data: null });
    };

    return (
        <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex justify-between items-center">
                    <TabsList>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="categories">Categories</TabsTrigger>
                    </TabsList>
                    <Button onClick={openCreateModal}> <PlusCircle className="mr-2 h-4 w-4" /> Add {activeTab === 'products' ? 'Product' : 'Category'} </Button>
                </div>
                <TabsContent value="products"><DataTable columns={productColumns} data={products} /></TabsContent>
                <TabsContent value="categories"><DataTable columns={categoryColumns} data={categories} /></TabsContent>
            </Tabs>

            <Dialog open={modalState.isOpen && (modalState.type === 'product' || modalState.type === 'category')} onOpenChange={(isOpen) => !isOpen && setModalState({ isOpen: false, type: null, data: null })}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{modalState.data ? 'Edit' : 'Create'} {modalState.type === 'product' ? 'Product' : 'Category'}</DialogTitle></DialogHeader>
                    {modalState.type === 'product' && <ProductForm initialData={modalState.data as Product} categories={categories} onSubmit={(v) => productMutation.mutate(v)} isSubmitting={isSubmitting} />}
                    {modalState.type === 'category' && <CategoryForm initialData={modalState.data as ProductCategory} onSubmit={(v) => categoryMutation.mutate(v)} isSubmitting={isSubmitting} />}
                </DialogContent>
            </Dialog>

            <Dialog open={modalState.isOpen && modalState.type === 'stock'} onOpenChange={(isOpen) => !isOpen && setModalState({ isOpen: false, type: null, data: null })}>
                 <DialogContent>
                    <DialogHeader><DialogTitle>Update Stock for {(modalState.data as Product)?.name}</DialogTitle></DialogHeader>
                    <UpdateStockForm 
                        initialQuantity={(modalState.data as Product)?.quantityOnHand ?? 0} 
                        onSubmit={(v) => stockMutation.mutate({ productId: (modalState.data as Product)!.id, quantity: v.quantity })} 
                        isSubmitting={isSubmitting} 
                    />
                </DialogContent>
            </Dialog>
        </>
    );
} 