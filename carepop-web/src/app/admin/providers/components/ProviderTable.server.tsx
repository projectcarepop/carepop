import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { ProviderTableClient } from './ProviderTable.client';

const providerSearchSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
});

export type GetProvidersParams = z.infer<typeof providerSearchSchema>;

export interface Provider {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string | null;
    is_active: boolean;
    user_id: string;
}

async function getProviders(params: GetProvidersParams) {
  const supabase = await createSupabaseServerClient();
  const { page, per_page, sort, search } = params;

  const [sortField, sortOrder] = sort?.split('.') || ['last_name', 'asc'];
  const offset = (page - 1) * per_page;

  let query = supabase
    .from('providers')
    .select('*', { count: 'exact' })
    .range(offset, offset + per_page - 1)
    .order(sortField, { ascending: sortOrder === 'asc' });

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching providers:', error);
    return { data: [], totalRecords: 0 };
  }

  return { data: data as Provider[], totalRecords: count ?? 0 };
}

export async function ProviderTable(props: GetProvidersParams) {
  const validatedParams = providerSearchSchema.parse(props);
  const { data, totalRecords } = await getProviders(validatedParams);

  return <ProviderTableClient data={data} totalRecords={totalRecords} />;
} 