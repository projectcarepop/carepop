import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { BatchesDataTable } from './components/batches-data-table';
import { IInventoryItem } from '../../components/inventory-items-list';
import { AddBatchModal } from './components/add-batch-modal';

export interface ISupplier {
    id: string;
    name: string;
}

export interface IBatch {
    id: string;
    item_id: string;
    batch_number: string;
    quantity: number;
    expiration_date: string;
    cost_per_item: number | null;
    supplier_id: string | null;
    supplier: { name: string } | null;
}

async function getItemDetails(itemId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('inventory_items')
        .select(`*, supplier:suppliers (name)`)
        .eq('id', itemId)
        .single();
    
    if (error || !data) {
        console.error('Error fetching item details:', error);
        return null;
    }
    return data as IInventoryItem & { supplier: { name: string } | null };
}

async function getItemBatches(itemId: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('inventory_item_batches')
        .select('*')
        .eq('item_id', itemId)
        .order('expiration_date', { ascending: true });

    if (error) {
        console.error('Error fetching item batches:', error);
        return [];
    }
    return data as unknown as IBatch[];
}

async function getActiveSuppliers() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

    if (error) {
        console.error('Error fetching suppliers:', error);
        return [];
    }
    return data as ISupplier[];
}

export default async function ItemBatchesPage({ params }: { params: { id: string } }) {
    const itemDetails = await getItemDetails(params.id);
    const batches = await getItemBatches(params.id);
    const suppliers = await getActiveSuppliers();

    if (!itemDetails) {
        notFound();
    }

    return (
        <div className="flex flex-col w-full gap-8">
            <div>
                <Link href="/admin/inventory?tab=items" className="text-sm text-muted-foreground hover:underline">
                    &larr; Back to Inventory
                </Link>
                <h1 className="text-2xl font-bold mt-2">{itemDetails.item_name}</h1>
                <p className="text-muted-foreground">{itemDetails.generic_name}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Item Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><p className="font-semibold">SKU</p><p>{itemDetails.sku || 'N/A'}</p></div>
                    <div><p className="font-semibold">Category</p><p>{itemDetails.category || 'N/A'}</p></div>
                    <div><p className="font-semibold">Supplier</p><p>{itemDetails.supplier?.name || 'N/A'}</p></div>
                    <div><p className="font-semibold">Status</p><p>{itemDetails.is_active ? 'Active' : 'Inactive'}</p></div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>Inventory Batches</CardTitle>
                        <CardDescription>
                            Manage stock quantity and expiration dates for each batch. Total Quantity: {batches.reduce((sum, batch) => sum + batch.quantity, 0)}
                        </CardDescription>
                    </div>
                    <AddBatchModal inventoryItemId={itemDetails.id} suppliers={suppliers} />
                </CardHeader>
                <CardContent>
                    <BatchesDataTable data={batches} suppliers={suppliers} />
                </CardContent>
            </Card>
        </div>
    );
} 