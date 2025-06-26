import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, Stethoscope, LineChart } from 'lucide-react';
import { cookies } from "next/headers"; // <-- IMPORT
import { createClient } from "@/lib/supabase/server";
import { getAdminStats } from "@/services/api";

type AdminStats = {
  totalUsers: number;
  totalClinics: number;
  appointmentsToday: number;
  pendingApprovals: number;
};

export default async function AdminDashboardPage() {
  const cookieStore = cookies(); // <-- GET COOKIES
  const supabase = createClient(cookieStore); // <-- PASS TO CLIENT
  let stats: AdminStats = {
    totalUsers: 0,
    totalClinics: 0,
    appointmentsToday: 0,
    pendingApprovals: 0,
  };

  try {
    stats = await getAdminStats(supabase);
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
  }

  // ... rest of the file is the same

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of the Carepop platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clinics</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClinics}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointmentsToday}</div>
            <p className="text-xs text-muted-foreground">Placeholder value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">Placeholder value</p>
          </CardContent>
        </Card>
      </div>

      {/* We can add more components here like recent activity, etc. */}
    </div>
  );
}
