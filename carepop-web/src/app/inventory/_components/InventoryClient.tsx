'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { columns, type InventoryItem } from './columns';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// This is a placeholder for the actual clinic type
type Clinic = {
    id: string;
    name: string;
};

interface InventoryClientProps {
    // We will pass the initial list of clinics from the server component
    clinics: Clinic[];
}

export default function InventoryClient({ clinics }: InventoryClientProps) {
    const { session } = useAuth();
    const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');

    const handleClinicChange = async (clinicId: string) => {
        if (!session) return;
        
        setSelectedClinicId(clinicId);
        setIsLoading(true);

        try {
            const response = await fetch(`/api/admin/clinics/${clinicId}/inventory`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch inventory data');
            }
            const data = await response.json();
            setInventoryItems(data.data || []);
        } catch (error) {
            console.error(error);
            // Handle error state in UI
            setInventoryItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
                {selectedClinicId && (
                    <Button>Add Stock</Button>
                )}
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Select a Clinic</CardTitle>
                </CardHeader>
                <CardContent>
                    <Select onValueChange={handleClinicChange} disabled={!session}>
                        <SelectTrigger className="w-full md:w-1/3">
                            <SelectValue placeholder="Select a clinic to view its inventory" />
                        </SelectTrigger>
                        <SelectContent>
                            {clinics.map((clinic) => (
                                <SelectItem key={clinic.id} value={clinic.id}>
                                    {clinic.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedClinicId && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Clinic Stock</CardTitle>
                        <div className="w-full max-w-sm">
                            <Input 
                                placeholder="Filter products..."
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable 
                            columns={columns} 
                            data={inventoryItems} 
                            isLoading={isLoading}
                            filterColumn="product.name"
                            globalFilter={globalFilter}
                            setGlobalFilter={setGlobalFilter}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 