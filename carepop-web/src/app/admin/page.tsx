import { Suspense } from 'react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

import AccessDenied from '@/components/layout/AccessDenied';
import AdminDashboard from './components/AdminDashboard';
import Stats from './components/Stats';
import { UserProfile } from '@/lib/contexts/AuthContext';


async function getAdminProfile(supabase: ReturnType<typeof createSupabaseServerClient>): Promise<UserProfile | null> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        console.error('Error fetching user:', authError);
        return null;
    }

    // Fetch the profile and roles for the user
    const { data: profile, error: profileError } = await supabase
        .from('users_view')
        .select(`*`)
        .eq('id', user.id)
        .single();
    
    if (profileError) {
        console.error('Error fetching profile for admin user:', profileError);
        return null;
    }

    // The 'users_view' should return 'roles' as a string array, so no mapping is needed.
    return profile as UserProfile;
}


export default async function AdminPage() {
    const supabase = createSupabaseServerClient();

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login?message=Please log in to view this page.');
    }

    const adminUser = await getAdminProfile(supabase);
    
    // Check for admin role, case-insensitive.
    const isAdmin = adminUser?.roles?.some((role: string) => role.toLowerCase() === 'admin');

    if (!isAdmin) {
        return <AccessDenied pageName="Admin Dashboard" />;
    }

    return (
        <AdminDashboard adminUser={adminUser}>
            <Suspense fallback={
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                    <p className="text-muted-foreground col-span-full">Loading dashboard stats...</p>
                </div>
            }>
                <Stats />
            </Suspense>
        </AdminDashboard>
    );
} 