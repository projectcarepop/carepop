"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { getAdminClinics, getInventoryForClinic } from '@/services/api';

interface Clinic {
  id: string;
  name: string;
}

interface InventoryItem {
    id: string;
    name: string;
    // This can be expanded based on the `columns.tsx` definition
}

export default function InventoryClient() {
    const { session } = useAuth();
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

        fetchInventory();
    }, [selectedClinic, session]);


    const handleClinicChange = (clinicId: string) => {
        setSelectedClinic(clinicId);
    };
    
    // TODO: Implement these functions
    const handleAddItem = () => console.log("Add new item");
    const handleEditItem = (itemId: string) => console.log("Edit item:", itemId);
    const handleDeleteItem = (itemId: string) => console.log("Delete item:", itemId);
    const handleViewBatches = (itemId: string) => console.log("View batches for item:", itemId);

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
                        <Select onValueChange={handleClinicChange} value={selectedClinic ?? ""}>
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
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 