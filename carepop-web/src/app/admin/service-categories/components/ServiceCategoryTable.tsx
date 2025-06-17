import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { ServiceCategoryTableClient } from './ServiceCategoryTableClient';

const serviceCategorySearchSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
});

export type GetServiceCategoriesParams = z.infer<typeof serviceCategorySearchSchema>;

async function getServiceCategories(params: GetServiceCategoriesParams) {
  const supabase = await createSupabaseServerClient();
  const { page, per_page, sort, search } = params;

  const [sortField, sortOrder] = sort?.split('.') || ['name', 'asc'];
  const offset = (page - 1) * per_page;

  let query = supabase
    .from('service_categories')
    .select('*', { count: 'exact' })
    .range(offset, offset + per_page - 1)
    .order(sortField, { ascending: sortOrder === 'asc' });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching service categories:', error);
    return { data: [], totalRecords: 0 };
  }

  return { data: data || [], totalRecords: count ?? 0 };
}

export async function ServiceCategoryTable(props: GetServiceCategoriesParams) {
  const validatedParams = serviceCategorySearchSchema.parse(props);
  const { data, totalRecords } = await getServiceCategories(validatedParams);

  return <ServiceCategoryTableClient data={data} totalRecords={totalRecords} />;
} 