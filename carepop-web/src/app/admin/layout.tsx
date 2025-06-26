import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin-dashboard/AdminSidebar'; // We can reuse the old sidebar

// This is a simplified version of the profile type needed for role checking.
// It's good practice to have a central types file, but this is fine for now.
type UserProfile = {
  id: string;
  role: string;
};

// This function securely fetches the user's profile from our backend API
// to verify their role. It requires the user's access token.
async function getAdminProfile(accessToken: string): Promise<UserProfile | null> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        console.error('FATAL: NEXT_PUBLIC_API_URL is not configured.');
        return null;
    }
    const res = await fetch(`${apiUrl}/api/me/profile`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
        cache: 'no-store', // Always check the role, don't cache
    });

    if (!res.ok) {
        return null;
    }
    return res.json();
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Create a server-side Supabase client with the user's cookies.
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // 2. Check for an active user session.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        // If no session, redirect to the sign-in page.
        return redirect('/sign-in?redirect=/admin');
    }
    
    // 3. Verify the user's role by calling our backend API.
    const userProfile = await getAdminProfile(session.access_token);

    // 4. If the profile can't be fetched or the role is not 'admin', redirect.
    if (userProfile?.role !== 'admin') {
        return redirect('/forbidden'); // A dedicated page for access denied
    }

    // 5. If all checks pass, render the admin layout with the sidebar.
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
} 