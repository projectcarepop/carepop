'use client';

import { ColumnDef } from '@tanstack/react-table';
import { IBatch, ISupplier } from '../page';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { BatchForm } from './batch-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { deleteInventoryItemBatch } from '@/lib/actions/inventory-item-batch.admin.actions';
import { useToast } from '@/hooks/use-toast';

const ActionsCell = ({ batch, suppliers }: { batch: IBatch, suppliers: ISupplier[] }) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const { toast } = useToast();

    const handleDelete = async () => {
        const result = await deleteInventoryItemBatch(batch.id, batch.item_id);
        if (result.success) {
            toast({ title: 'Success', description: 'Batch deleted successfully.' });
        } else {
            toast({ title: 'Error', description: result.message, variant: 'destructive' });
        }
    };

    return (
        <>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                            Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the batch.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Batch</DialogTitle>
                    </DialogHeader>
                    <BatchForm
                        inventoryItemId={batch.item_id}
                        suppliers={suppliers}
                        initialData={batch}
                        onSuccess={() => setIsEditDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
};

export const getColumns = (suppliers: ISupplier[]): ColumnDef<IBatch>[] => [
    {
        accessorKey: 'batch_number',
        header: 'Batch Number',
    },
    {
        accessorKey: 'quantity',
        header: 'Quantity',
    },
    {
        accessorKey: 'cost_per_item',
        header: 'Cost per Item',
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('cost_per_item') || '0');
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PHP',
            }).format(amount);
            return <div>{formatted}</div>;
        },
    },
    {
        accessorKey: 'expiration_date',
        header: 'Expiration Date',
        cell: ({ row }) => {
            const date = row.getValue('expiration_date');
            if (!date) return 'N/A';
            return new Date(date as string).toLocaleDateString();
        }
    },
    {
        accessorKey: 'supplier.name',
        header: 'Supplier',
        cell: ({ row }) => row.original.supplier?.name || 'N/A',
    },
    {
        id: 'actions',
        cell: ({ row }) => <ActionsCell batch={row.original} suppliers={suppliers} />,
    },
]; 