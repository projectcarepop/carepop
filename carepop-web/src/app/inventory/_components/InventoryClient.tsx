"use client";

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { columns, InventoryItem } from './columns';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { getAdminClinics, getInventoryForClinic, upsertInventoryItem, deleteInventoryItem, getProductCategories, UpsertInventoryItemPayload } from '@/services/api';
import { useToast } from "@/components/ui/use-toast";
import { UpsertInventoryItemForm } from './UpsertInventoryItemForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlusCircle } from 'lucide-react';

// This type should match the form's output, which uses numbers for price
type FormValues = Omit<UpsertInventoryItemPayload, 'purchasePrice' | 'sellingPrice'> & {
    purchasePrice?: number;
    sellingPrice?: number;
};

export default function InventoryClient() {
    const { session } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    
    const [selectedClinic, setSelectedClinic] = React.useState<string | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState<InventoryItem | undefined>(undefined);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [itemToDelete, setItemToDelete] = React.useState<InventoryItem | undefined>(undefined);

    const { data: clinics, isLoading: isLoadingClinics } = useQuery({
        queryKey: ['adminClinics'],
        queryFn: () => getAdminClinics(session!.access_token!),
        enabled: !!session?.access_token,
    });

    React.useEffect(() => {
        if (!selectedClinic && clinics && clinics.length > 0) {
            setSelectedClinic(clinics[0].id);
        }
    }, [clinics]);

    const { data: inventory = [], isLoading: isLoadingInventory } = useQuery({
        queryKey: ['inventory', selectedClinic],
        fn: () => getInventoryForClinic(selectedClinic!, session!.access_token!).then(res => res.data),
        enabled: !!selectedClinic && !!session?.access_token,
    });
    
    const { data: productCategories = [] } = useQuery({
        queryKey: ['productCategories'],
        queryFn: () => getProductCategories(session!.access_token!).then(res => res.data),
        enabled: !!session?.access_token,
    });

    const upsertMutation = useMutation({
        mutationFn: (values: FormValues) => {
            if (!selectedClinic) throw new Error("No clinic selected.");
            const payload: UpsertInventoryItemPayload = {
                ...values,
                clinicId: selectedClinic,
                purchasePrice: values.purchasePrice ? String(values.purchasePrice) : undefined,
                sellingPrice: values.sellingPrice ? String(values.sellingPrice) : undefined,
            };
            return upsertInventoryItem(payload, session!.access_token!, editingItem?.id);
        },
        onSuccess: () => {
            toast({ title: "Success", description: `Item has been saved.` });
            queryClient.invalidateQueries({ queryKey: ['inventory', selectedClinic] });
            setIsModalOpen(false);
            setEditingItem(undefined);
        },
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (itemId: string) => deleteInventoryItem(itemId, session!.access_token!),
        onSuccess: () => {
            toast({ title: "Success", description: "Item deleted." });
            queryClient.invalidateQueries({ queryKey: ['inventory', selectedClinic] });
        },
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.message });
        },
        onSettled: () => {
            setIsDeleteDialogOpen(false);
            setItemToDelete(undefined);
        }
    });

    const handleEditItem = (item: InventoryItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (item: InventoryItem) => {
        setItemToDelete(item);
        setIsDeleteDialogOpen(true);
    };

    const handleSubmit = (values: FormValues) => {
        upsertMutation.mutate(values);
    };

    if (isLoadingClinics) {
        return <p>Loading clinics...</p>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>
                        Select a clinic to view and manage its inventory.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Select onValueChange={setSelectedClinic} value={selectedClinic ?? ""}>
                        <SelectTrigger className="w-full sm:w-[300px]">
                            <SelectValue placeholder="Select a clinic..." />
                        </SelectTrigger>
                        <SelectContent>
                            {clinics?.map((clinic: { id: string; name: string }) => (
                                <SelectItem key={clinic.id} value={clinic.id}>
                                    {clinic.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedClinic && (
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Inventory Items</CardTitle>
                            <p className="text-sm text-muted-foreground">Items available at the selected clinic.</p>
                        </div>
                        <Button onClick={() => { setEditingItem(undefined); setIsModalOpen(true); }}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Item
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <DataTable 
                            columns={columns({ onEdit: handleEditItem, onDelete: handleDeleteClick, onViewBatches: () => {} })} 
                            data={inventory}
                            isLoading={isLoadingInventory} 
                            filterColumn="itemName"
                        />
                    </CardContent>
                </Card>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</DialogTitle>
                    </DialogHeader>
                    <UpsertInventoryItemForm 
                        initialData={editingItem}
                        onSubmit={handleSubmit}
                        isPending={upsertMutation.isPending}
                        productCategories={productCategories}
                        onClose={() => setIsModalOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the item: <span className="font-semibold">{itemToDelete?.itemName}</span>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => itemToDelete && deleteMutation.mutate(itemToDelete.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Continue'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 