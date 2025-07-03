"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { columns, InventoryItem } from './columns';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { getAdminClinics, getInventoryForClinic, upsertInventoryItem } from '@/services/api';
import { useToast } from "@/components/ui/use-toast"
import UpsertInventoryItemModal from './UpsertInventoryItemModal';

interface Clinic {
  id: string;
  name: string;
}

export default function InventoryClient() {
    const { session } = useAuth();
    const { toast } = useToast();
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const fetchInventory = async () => {
        if (selectedClinic && session?.access_token) {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getInventoryForClinic(selectedClinic, session.access_token);
                setInventory(data);
            } catch (err: any) {
                setError(err.message || "Failed to fetch inventory.");
            } finally {
                setIsLoading(false);
            }
        } else {
            setInventory([]); 
        }
    };
    
    useEffect(() => {
        if (session?.access_token) {
            const fetchClinics = async () => {
                try {
                    const fetchedClinics = await getAdminClinics(session.access_token);
                    setClinics(fetchedClinics);
                    if (fetchedClinics.length > 0 && !selectedClinic) {
                        setSelectedClinic(fetchedClinics[0].id);
                    }
                } catch (err: any) {
                    setError(err.message || 'Failed to fetch clinics');
                }
            };
            fetchClinics();
        }
    }, [session, selectedClinic]);

    useEffect(() => {
        fetchInventory();
    }, [selectedClinic, session]);

    const handleAddItem = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleEditItem = (item: InventoryItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteItem = (item: InventoryItem) => {
        // TODO: Implement delete functionality
        console.log("Delete item:", item.id);
    };

    const handleViewBatches = (item: InventoryItem) => {
        console.log("View batches for item:", item.id);
    };

    const handleSubmit = async (values: any) => {
        if (!selectedClinic || !session?.access_token) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Cannot save item. No clinic selected or not authenticated.",
            });
            return;
        }
        setIsSubmitting(true);
        try {
            // Ensure numeric values are numbers, not strings from the form
            const payload = {
                ...values,
                clinicId: selectedClinic,
                quantityOnHand: Number(values.quantityOnHand),
                reorderLevel: Number(values.reorderLevel),
                purchasePrice: values.purchasePrice ? Number(values.purchasePrice) : null,
                sellingPrice: values.sellingPrice ? Number(values.sellingPrice) : null,
            };

            await upsertInventoryItem(payload, session.access_token, editingItem?.id);
            toast({
                title: "Success",
                description: `Inventory item has been successfully ${editingItem ? 'updated' : 'added'}.`,
            });
            setIsModalOpen(false);
            fetchInventory(); // Refresh the list
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Failed to save item",
                description: error.message || "An unknown error occurred.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!session) {
        return <p>Loading session...</p>;
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
                                {clinics.map((clinic) => (
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

                    {error && <p className="text-red-500">{error}</p>}
                </CardContent>
            </Card>

            {selectedClinic && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Inventory Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <DataTable 
    columns={columns({ onEdit: handleEditItem, onDelete: handleDeleteItem, onViewBatches: handleViewBatches })} 
    data={inventory}
    isLoading={isLoading} 
    filterColumn="name"
/>
                    </CardContent>
                </Card>
            )}

            <UpsertInventoryItemModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                item={editingItem}
                isLoading={isSubmitting}
            />
        </div>
    );
} 