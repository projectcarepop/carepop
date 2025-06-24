import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { UsersClient } from '@/components/admin-dashboard/users/UsersClient';
import { type UserProfile } from '@/types/app';

async function getUsers(accessToken: string): Promise<UserProfile[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        console.error('FATAL: API URL is not configured.');
        return [];
    }
    
    try {
        const res = await fetch(`${apiUrl}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            cache: 'no-store',
        });
        if (!res.ok) {
            console.error(`Failed to fetch users: ${res.statusText}`);
            return [];
        }
        const data = await res.json();
        return data.data as UserProfile[];
    } catch (error) {
        console.error('An unexpected error occurred while fetching users:', error);
        return [];
    }
}

export default async function ManageUsersPage() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return null;
    
    const initialUsers = await getUsers(session.access_token);
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Manage Users</h1>
                <p className="text-muted-foreground">
                    View and manage user roles within the system.
                </p>
            </div>
            <UsersClient initialData={initialUsers} />
        </div>
    );
} 