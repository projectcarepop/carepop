import { InventoryItemForm } from '../../../components/inventory-item-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

async function getItem(id: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('inventory_items').select('*').eq('id', id).single();
    if (error) notFound();
    return data;
}

async function getSuppliers() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('suppliers').select('id, name').order('name');
    if (error) return [];
    return data;
}

export default async function EditInventoryItemPage({ params }: { params: { id: string }}) {
  const [item, suppliers] = await Promise.all([
      getItem(params.id),
      getSuppliers()
  ]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/inventory?tab=items">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory Items
          </Link>
        </Button>
      </div>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Inventory Item</h2>
      </div>
      <InventoryItemForm initialData={item} suppliers={suppliers} />
    </div>
  );
}