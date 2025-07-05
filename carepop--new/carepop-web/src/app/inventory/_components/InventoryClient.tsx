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

export default function InventoryClient() {
    const { session } = useAuth();
    const { toast } = useToast();
    const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [isLoadingClinics, setIsLoadingClinics] = useState(true);
    const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);

    const queryClient = useQueryClient();

    const clinicsQuery = useQuery({
        queryKey: ['clinics'],
        queryFn: getAdminClinics,
        onSuccess: (data) => {
            setSelectedClinic(data[0].id);
            setIsLoadingClinics(false);
        },
        onError: (error) => {
            console.error('Error loading clinics:', error);
            setIsLoadingClinics(false);
        },
        enabled: true
    });

    const inventoryQuery = useQuery({
        queryKey: ['inventory', selectedClinic],
        queryFn: () => getInventoryForClinic(selectedClinic!, session!.access_token!),
        enabled: !!selectedClinic && !!session
    });

    const productCategoriesQuery = useQuery({
        queryKey: ['productCategories'],
        queryFn: getProductCategories,
        enabled: true
    });

    const upsertMutation = useMutation({
        mutationFn: (values: UpsertInventoryItemPayload) => {
            if (!selectedClinic) throw new Error("No clinic selected.");
            
            const payload = { 
                ...values, 
                clinicId: selectedClinic,
                // Ensure numeric fields sent to the API are strings as expected
                purchasePrice: values.purchasePrice ? String(values.purchasePrice) : undefined,
                sellingPrice: values.sellingPrice ? String(values.sellingPrice) : undefined,
            };
            return upsertInventoryItem(payload, session!.access_token!, editingItem?.id);
        },
        onSuccess: () => {
            toast({ title: "Success", description: `Item ${editingItem ? 'updated' : 'created'}.` });
            queryClient.invalidateQueries(['inventory', selectedClinic]);
        },
        onError: (error) => {
            console.error('Error upserting item:', error);
            toast({ title: "Error", description: "Failed to update item. Please try again later." });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteInventoryItem(id, session!.access_token!),
        onSuccess: () => {
            toast({ title: "Success", description: "Item deleted." });
            queryClient.invalidateQueries(['inventory', selectedClinic]);
        },
        onError: (error) => {
            console.error('Error deleting item:', error);
            toast({ title: "Error", description: "Failed to delete item. Please try again later." });
        }
    });

    const handleDeleteItem = (item: InventoryItem) => {
        // TODO: Add a confirmation dialog before deleting
        deleteMutation.mutate(item.id);
    };

    const handleSubmit = (values: UpsertInventoryItemPayload) => {
        upsertMutation.mutate(values);
    };

    useEffect(() => {
        if (productCategoriesQuery.data) {
            setProductCategories(productCategoriesQuery.data);
        }
    }, [productCategoriesQuery.data]);

    if (isLoadingClinics) {
        return <div>Loading clinics...</div>;
    }

    return (
        <div>
            <UpsertInventoryItemModal
                onSubmit={handleSubmit}
                item={editingItem}
                isLoading={upsertMutation.isPending}
                productCategories={productCategories}
            />
        </div>
    );
} 