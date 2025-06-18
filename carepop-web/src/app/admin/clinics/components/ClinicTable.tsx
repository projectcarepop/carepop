import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { ClinicTableClient } from './ClinicTableClient';

const clinicSearchSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),  
});

export type GetClinicsParams = z.infer<typeof clinicSearchSchema>;

export interface Clinic {
  id: string;
  name: string;
  full_address?: string | null;
  locality?: string | null;
  region?: string | null;
  contact_phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

async function getClinics(params: GetClinicsParams) {
  const supabase = await createSupabaseServerClient();
  const { page, per_page, sort, search } = params;

  const [sortField, sortOrder] = sort?.split('.') || ['name', 'asc'];
  const offset = (page - 1) * per_page;

  let query = supabase
    .from('clinics')
    .select(`
        id, name, full_address, locality, region, contact_phone, is_active, created_at, updated_at
    `, { count: 'exact' })
    .range(offset, offset + per_page - 1)
    .order(sortField, { ascending: sortOrder === 'asc' });

  if (search) {
    query = query.or(`name.ilike.%${search}%,locality.ilike.%${search}%,region.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching clinics:', error);
    return { data: [], totalRecords: 0 };
  }

  return { data: data as Clinic[], totalRecords: count ?? 0 };
}

export async function ClinicTable(props: GetClinicsParams) {
  const validatedParams = clinicSearchSchema.parse(props);
  const { data, totalRecords } = await getClinics(validatedParams);

  return <ClinicTableClient data={data} totalRecords={totalRecords} />;
} 