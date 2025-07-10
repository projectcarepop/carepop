import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminUsers } from '@/services/api';
import UsersClient from './_components/UsersClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { requireAdminRole } from '@/lib/utils/auth';

/**
 * This is the main server component for the Admin Users page.
 * It handles session checks, fetches the initial list of users, and
 * passes the data to the client component.
 */
export default async function AdminUsersPage() {
  // Require admin role for this page (managers cannot access)
  await requireAdminRole(['admin']);

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/users');
  }

  try {
    const users = await getAdminUsers(session.access_token, { limit: 10 });
    return <UsersClient initialUsers={users} />;
  } catch (error: any) {
    console.error(`[AdminUsersPage] Error fetching users:`, error);
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
        redirect('/forbidden');
    }

    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Failed to Load Users</AlertTitle>
          <AlertDescription>
            <p>There was an error fetching the user data from the server.</p>
            <p className="mt-2 font-mono text-xs">Error: {error.message}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}
