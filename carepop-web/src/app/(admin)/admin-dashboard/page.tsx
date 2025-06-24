import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
    // In the future, we could fetch real stats from an API endpoint.
    // const stats = await getAdminStats();

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's an overview of your platform.
                    </p>
                </div>
            </div>

            {/* Placeholder for future stats cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Users</CardTitle>
                        <CardDescription>Loading...</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">-</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Clinics</CardTitle>
                        <CardDescription>Loading...</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">-</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Appointments Today</CardTitle>
                        <CardDescription>Loading...</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">-</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Approvals</CardTitle>
                        <CardDescription>Loading...</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">-</p>
                    </CardContent>
                </Card>
            </div>
             {/* We can add more sections here like recent activity etc. */}
        </div>
    );
} 