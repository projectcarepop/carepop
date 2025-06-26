import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getAdminUsers } from "@/services/api";
import { UserManagementClient } from "./_components/user-management-client";

export default async function UserManagementPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const users = await getAdminUsers(supabase);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          View and manage user roles in the platform.
        </p>
      </div>
      <UserManagementClient users={users} />
    </div>
  );
} 