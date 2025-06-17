import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { ServiceListClient } from './ServiceListClient'; // This will be the new client component

const serviceSearchSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
});

export type GetServicesParams = z.infer<typeof serviceSearchSchema>;

async function getServices(params: GetServicesParams) {
  const supabase = await createSupabaseServerClient();
  const { page, per_page, sort, search } = params;

  const [sortField, sortOrder] = sort?.split('.') || ['name', 'asc'];
  const offset = (page - 1) * per_page;

  let query = supabase
    .from('services')
    .select(`
        *,
        category:service_categories(name)
    `, { count: 'exact' })
    .range(offset, offset + per_page - 1)
    .order(sortField, { ascending: sortOrder === 'asc' });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching services:', error);
    return { data: [], totalRecords: 0 };
  }

  return { data: data || [], totalRecords: count ?? 0 };
}

export async function ServiceList(props: GetServicesParams) {
  const validatedParams = serviceSearchSchema.parse(props);
  const { data, totalRecords } = await getServices(validatedParams);

  // We are renaming the component conceptually but keeping the filename for now.
  // The client component will contain the actual list/table.
  return <ServiceListClient data={data} totalRecords={totalRecords} />;
} 