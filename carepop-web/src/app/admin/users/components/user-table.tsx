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

// This function is now simplified to query the `users_view`
async function getUsers(params: GetUsersParams) {
  const supabase = await createSupabaseServerClient();
  const { page, per_page, sort, search } = params;

  const [sortField, sortOrder] = sort?.split('.') || ['created_at', 'desc'];
  const offset = (page - 1) * per_page;

  // Query the users_view which joins profiles, auth.users, and user_roles
  let query = supabase
    .from('users_view')
    .select(
      `id, email, first_name, last_name, roles, created_at`,
      { count: 'exact' }
    )
    .range(offset, offset + per_page - 1)
    .order(sortField, { ascending: sortOrder === 'asc' });

  if (search) {
    // Search across name and email from the view
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching users:', error);
    return { data: [], totalRecords: 0 };
  }
  
  // Map the data from the view to the shape the client expects
  const users: User[] = (data || []).map((user) => ({
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    // The view provides roles as an array, we'll display the first one.
    role: user.roles?.[0] || 'User', 
    createdAt: user.created_at,
  }));

  return { data: users, totalRecords: count ?? 0 };
}

export async function UserTable(props: GetUsersParams) {
  const validatedParams = userSearchSchema.parse(props);
  const { data, totalRecords } = await getUsers(validatedParams);

  return <UserTableClient data={data} totalRecords={totalRecords} />;
}