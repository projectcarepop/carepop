import { createSupabaseServerClient } from '@/lib/supabase/server';
import { SuppliersListClient } from './suppliers-list.client';
import { GetInventoryItemsParams } from './inventory-items-list'; // Re-using the same search param type

export interface ISupplier {
  id: string;
  name: string;
  contact_person?: string | null;
  contact_email?: string | null;
  is_active: boolean;
}

async function getSuppliers(params: GetInventoryItemsParams) {
  const supabase = await createSupabaseServerClient();
  const { page, per_page, sort, search } = params;

  const [sortField, sortOrder] = sort?.split('.') || ['name', 'asc'];
  const offset = (page - 1) * per_page;

  let query = supabase
    .from('suppliers')
    .select('*', { count: 'exact' })
    .range(offset, offset + per_page - 1)
    .order(sortField, { ascending: sortOrder === 'asc' });

  if (search) {
    query = query.or(`name.ilike.%${search}%,contact_person.ilike.%${search}%,contact_email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching suppliers:', error);
    return { data: [], totalRecords: 0 };
  }

  return { data: (data as unknown as ISupplier[]) || [], totalRecords: count ?? 0 };
}

export async function SuppliersList(props: GetInventoryItemsParams) {
  // We can reuse the same Zod schema if the params are the same
  const { data, totalRecords } = await getSuppliers(props);

  return <SuppliersListClient data={data} totalRecords={totalRecords} />;
} 