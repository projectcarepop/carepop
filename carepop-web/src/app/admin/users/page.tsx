import UsersClient from './_components/UsersClient';
import { createClient } from '@/lib/supabase/server';
import { AdminUser } from '@/lib/types';

// This is a server component that fetches initial data
export default async function ManageUsersPage() {
  const supabase = createClient();

  // For users, we need to call an RPC function to get the full list with emails
  const { data: users, error } = await supabase.rpc('get_all_users_with_roles');

  if (error) {
    return (
      <div className="text-red-500">
        Failed to load users: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">
            A list of all users in the system.
          </p>
        </div>
        {/* We won't have a create user button, as users are created on signup */}
      </div>
      <div className="mt-6">
        <UsersClient data={users as AdminUser[] || []} />
      </div>
    </div>
  );
}
