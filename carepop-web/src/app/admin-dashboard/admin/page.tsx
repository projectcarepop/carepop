import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

async function getAdminStats(accessToken: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        console.error('API URL not configured');
        return null;
    }
    try {
        const res = await fetch(`${apiUrl}/api/admin/stats`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            cache: 'no-store', // Always fetch fresh stats
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        return null;
    }
}

export default async function AdminDashboardPage() {
    const supabase = createClient(cookies());
    const { data: { session } } = await supabase.auth.getSession();
    
    // The layout already protects this page, but a session check is good practice.
    if (!session) return null;

    const stats = await getAdminStats(session.access_token);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here&apos;s an overview of your platform.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Users</CardTitle>
                        <CardDescription>All registered users</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats?.totalUsers ?? '-'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Clinics</CardTitle>
                        <CardDescription>All registered clinics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats?.totalClinics ?? '-'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Appointments Today</CardTitle>
                        <CardDescription>Coming soon</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats?.appointmentsToday ?? '-'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Approvals</CardTitle>
                        <CardDescription>Coming soon</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats?.pendingApprovals ?? '-'}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 