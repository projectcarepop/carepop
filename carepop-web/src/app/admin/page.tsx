'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, CreditCard, ShieldCheck, CalendarCheck, Stethoscope } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDashboardStats, grantAdminRole } from "@/lib/actions/dashboard.admin.actions";

interface DashboardStats {
  totalClinics: number;
  totalProviders: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [granting, setGranting] = useState(false);
  const [grantResult, setGrantResult] = useState<{success: boolean, message: string} | null>(null);


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getDashboardStats();
        setStats(result.data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred while fetching stats.");
        }
      }
    };
    fetchStats();
  }, []);

  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGranting(true);
    setGrantResult(null);

    try {
      const result = await grantAdminRole(userId);
      setGrantResult(result);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setGrantResult({ success: false, message: e.message });
      } else {
        setGrantResult({ success: false, message: 'An unknown error occurred while granting the role.' });
      }
    } finally {
      setGranting(false);
    }
  };


  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stats) {
     return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clinics
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClinics}</div>
            <p className="text-xs text-muted-foreground">
              Total number of clinics in the system.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Providers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProviders}</div>
            <p className="text-xs text-muted-foreground">
             Total number of providers registered.
            </p>
          </CardContent>
        </Card>
        {/* Placeholder cards for future stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">
              Coming soon.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users This Month</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">
              Coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Tools</CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <form onSubmit={handleGrantAdmin} className="space-y-4">
                    <div>
                        <label htmlFor="userId" className="block text-sm font-medium text-gray-700">Grant Admin Role</label>
                        <div className="mt-1 flex space-x-2">
                            <Input
                                id="userId"
                                name="userId"
                                type="text"
                                required
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="Enter User ID"
                                className="flex-grow"
                            />
                            <Button type="submit" disabled={granting || !userId}>
                                {granting ? 'Granting...' : 'Grant'}
                            </Button>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                            Enter the Supabase User ID of the user you want to make an admin.
                        </p>
                    </div>
                </form>
                {grantResult && (
                  <div className="mt-4">
                    <Alert variant={grantResult.success ? 'default' : 'destructive'}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{grantResult.success ? 'Success' : 'Error'}</AlertTitle>
                      <AlertDescription>
                        {grantResult.message}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
            </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          href="/admin/clinics"
          title="Clinic Management"
          description="Add, edit, and manage FPOP clinics."
          icon={<Stethoscope className="w-8 h-8 text-gray-500" />}
        />
        <DashboardCard
          href="/admin/providers"
          title="Provider Management"
          description="Add, edit, and manage healthcare providers."
          icon={<Users className="w-8 h-8 text-gray-500" />}
        />
        <DashboardCard
          href="/admin/appointments"
          title="Appointment Management"
          description="View and confirm patient appointments."
          icon={<CalendarCheck className="w-8 h-8 text-gray-500" />}
        />
      </div>
    </div>
  );
}

function DashboardCard({ href, title, description, icon }: { href: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="block hover:bg-muted/50 transition-colors rounded-lg">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
} 