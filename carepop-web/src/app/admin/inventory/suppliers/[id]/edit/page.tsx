import { SupplierForm } from '../../../components/supplier-form';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

async function getSupplier(id: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('suppliers').select('*').eq('id', id).single();
    if (error) notFound();
    return data;
}

export default async function EditSupplierPage({ params }: { params: { id: string }}) {
  const supplier = await getSupplier(params.id);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <SupplierForm initialData={supplier} />
    </div>
  );
}