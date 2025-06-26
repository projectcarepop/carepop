import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getAdminUsers } from '@/services/api';
import { UserManagementClient } from './_components/user-management-client';

export default async function UserManagementPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const initialUsers = await getAdminUsers(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          A list of all users in the system. You can view details and manage roles.
        </p>
      </div>
      <UserManagementClient initialUsers={initialUsers} />
    </div>
  );
} 