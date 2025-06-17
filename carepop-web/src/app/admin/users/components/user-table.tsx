import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { UserTableClient } from './user-table-client';

const userSearchSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
});

export type GetUsersParams = z.infer<typeof userSearchSchema>;

// We need to define the User type based on what the client component expects.
// Ideally, this would be in a shared types file.
export type User = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
};

// Type for the raw data returned by the Supabase query
type RawUser = {
    id: string;
    email: { email: string } | null;
    firstName: string | null;
    lastName: string | null;
    role: string;
    createdAt: string;
}

async function getUsers(params: GetUsersParams) {
  const supabase = await createSupabaseServerClient();
  const { page, per_page, sort, search } = params;

  const [sortField, sortOrder] = sort?.split('.') || ['created_at', 'desc'];
  const offset = (page - 1) * per_page;

  let query = supabase
    .from('profiles')
    .select(`
      id:user_id,
      email:users(email),
      firstName:first_name,
      lastName:last_name,
      role,
      createdAt:created_at
    `, { count: 'exact' })
    .range(offset, offset + per_page - 1)
    .order(sortField, { ascending: sortOrder === 'asc' });

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,users(email).ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching users:', error);
    return { data: [], totalRecords: 0 };
  }

  const users = (data as RawUser[]).map((d) => ({
      ...d,
      email: d.email?.email || null
  }))

  return { data: users, totalRecords: count ?? 0 };
}

export async function UserTable(props: GetUsersParams) {
  const validatedParams = userSearchSchema.parse(props);
  const { data, totalRecords } = await getUsers(validatedParams);

  return <UserTableClient data={data} totalRecords={totalRecords} />;
} 