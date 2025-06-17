import { InventoryItemForm } from '../../components/inventory-item-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function getSuppliers() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('suppliers').select('id, name').order('name');
    if (error) return [];
    return data;
}

export default async function NewInventoryItemPage() {
  const suppliers = await getSuppliers();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <InventoryItemForm suppliers={suppliers} />
    </div>
  );
}