"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { columns, InventoryItem } from './columns';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { getAdminClinics, getInventoryForClinic, upsertInventoryItem, deleteInventoryItem, getProductCategories, UpsertInventoryItemPayload } from '@/services/api';
import { useToast } from "@/components/ui/use-toast"
import UpsertInventoryItemModal from './UpsertInventoryItemModal';
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

// This type should match the form's output, which uses numbers for price
type FormValues = Omit<UpsertInventoryItemPayload, 'purchasePrice' | 'sellingPrice'> & {
    purchasePrice?: number;
    sellingPrice?: number;
};

export default function InventoryClient() {
    const { session } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    
    const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    // State for controlling the Delete confirmation dialog
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

    const { data: clinics, isLoading: isLoadingClinics } = useQuery({
        queryKey: ['adminClinics'],
        queryFn: () => getAdminClinics(session!.access_token!),
        enabled: !!session?.access_token,
    });

    // Set the first clinic as selected by default once clinics have loaded
    useEffect(() => {
        if (clinics && clinics.length > 0 && !selectedClinic) {
            setSelectedClinic(clinics[0].id);
        }
    }, [clinics, selectedClinic]);

    const { data: inventory = [], isLoading: isLoadingInventory } = useQuery({
        queryKey: ['inventory', selectedClinic],
        queryFn: () => getInventoryForClinic(selectedClinic!, session!.access_token!).then(res => res.data),
        enabled: !!selectedClinic && !!session?.access_token,
    });
    
    const { data: productCategories = [] } = useQuery({
        queryKey: ['productCategories'],
        queryFn: () => getProductCategories(session!.access_token!).then(res => res.data),
        enabled: !!session?.access_token,
    });

    const upsertMutation = useMutation({
        mutationFn: (values: FormValues) => {
            if (!selectedClinic) {
                throw new Error("No clinic selected.");
            }
            // Convert numbers to strings for the API payload
            const payload: UpsertInventoryItemPayload = {
                ...values,
                clinicId: selectedClinic,
                purchasePrice: values.purchasePrice ? String(values.purchasePrice) : undefined,
                sellingPrice: values.sellingPrice ? String(values.sellingPrice) : undefined,
            };
            return upsertInventoryItem(payload, session!.access_token!, editingItem?.id);
        },
        onSuccess: () => {
            toast({ title: "Success", description: `Item ${editingItem ? 'updated' : 'created'}.` });
            queryClient.invalidateQueries({ queryKey: ['inventory', selectedClinic] });
            setIsModalOpen(false);
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
            setItemToDelete(null);
        }
    });

    const handleAddItem = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEditItem = (item: InventoryItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteItem = (item: InventoryItem) => {
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
                    <p className="text-sm text-muted-foreground">
                        Select a clinic to view and manage its inventory.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                        <Button onClick={handleAddItem} disabled={!selectedClinic}>
                            Add New Item
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {selectedClinic && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Inventory Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable 
                            columns={columns({ onEdit: handleEditItem, onDelete: handleDeleteItem, onViewBatches: () => {} })} 
                            data={inventory}
                            isLoading={isLoadingInventory} 
                            filterColumn="itemName"
                        />
                    </CardContent>
                </Card>
            )}

            <UpsertInventoryItemModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                item={editingItem}
                isLoading={upsertMutation.isPending}
                productCategories={productCategories}
            />

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