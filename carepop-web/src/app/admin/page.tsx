'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    // This is not ideal for Server Components, but for a quick fix to debug, we fetch on client.
    // In a real app, we'd pass initial data as props from a server component.
    const fetchStats = async () => {
      try {
        const cookieStore = document.cookie.split('; ').reduce((acc, current) => {
          const [name, value] = current.split('=');
          acc[name] = value;
          return acc;
        }, {} as Record<string, string>);
        
        const authTokenKey = Object.keys(cookieStore).find(name => name.startsWith('sb-') && name.endsWith('-auth-token'));
        const token = authTokenKey ? cookieStore[authTokenKey] : null;

        if (!token) throw new Error('Authentication token not found.');

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
        const response = await fetch(`${apiBaseUrl}/api/v1/admin/stats`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics. Please ensure you are logged in as an admin.');
        }
        const data = await response.json();
        setStats(data.data);
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
        const cookieStore = document.cookie.split('; ').reduce((acc, current) => {
          const [name, value] = current.split('=');
          acc[name] = value;
          return acc;
        }, {} as Record<string, string>);
        
        const authTokenKey = Object.keys(cookieStore).find(name => name.startsWith('sb-') && name.endsWith('-auth-token'));
        const token = authTokenKey ? cookieStore[authTokenKey] : null;

      if (!token) throw new Error('Authentication token not found.');

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${apiBaseUrl}/api/v1/admin/users/${userId}/grant-admin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const result = await response.json();
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Link href="/admin/clinics">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>Manage Clinics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View, create, edit, and delete clinics.
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/providers">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>Manage Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View, create, edit, and delete providers.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
} 