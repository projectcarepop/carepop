import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { ServiceCategoryTableClient } from './ServiceCategoryTableClient';

const searchSchema = z.object({
  search: z.string().optional(),
});

export type SearchParams = z.infer<typeof searchSchema>;

async function getServiceCategories(params: SearchParams) {
  const supabase = await createSupabaseServerClient();
  const { search } = params;

  let query = supabase
    .from('service_categories')
    .select('*')
    .order('name', { ascending: true });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching service categories:', error);
    return { data: [], error: 'Failed to load categories: An unknown error occurred' };
  }

  return { data: data || [], error: null };
}

export default async function ServiceCategoryList(props: SearchParams) {
  const validatedParams = searchSchema.parse(props);
  const { data, error } = await getServiceCategories(validatedParams);

  return <ServiceCategoryTableClient data={data} error={error} />;
}