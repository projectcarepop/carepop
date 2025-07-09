'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  Stethoscope,
  Building,
  Calendar,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getDashboardMetrics } from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect } from 'react';


// Define types for our metrics payload
type CoreCounts = {
  users: number;
  doctors: number;
  clinics: number;
  appointments: number;
};

type TimeSeriesDataPoint = {
  date: string;
  count: number;
};

type AggregateDataPoint = {
  status?: string;
  serviceName?: string;
  clinicName?: string;
  count: number;
};

type DashboardMetrics = {
  coreCounts: CoreCounts;
  timeSeries: {
    appointmentsOverTime: TimeSeriesDataPoint[];
    usersOverTime: TimeSeriesDataPoint[];
  };
  aggregates: {
    appointmentsByStatus: AggregateDataPoint[];
    topServices: AggregateDataPoint[];
    topClinics: AggregateDataPoint[];
  };
};

// Colors for the pie chart, using HSL values from globals.css
const BRAND_COLORS = {
    primary: 'hsl(349 100% 65%)',
    secondary: 'hsl(230 71% 27%)',
    accent: 'hsl(349 90% 90%)',
    muted: 'hsl(208 7% 46%)',
    success: 'hsl(152 69% 31%)'
};

const PIE_CHART_COLORS = [BRAND_COLORS.primary, BRAND_COLORS.secondary, BRAND_COLORS.success, BRAND_COLORS.accent];

export default function AdminDashboardPage() {
    const router = useRouter();
    const { session, isLoading: isAuthLoading } = useAuth();
    
    const { data: metrics, isLoading, isError, error } = useQuery<DashboardMetrics, Error>({
        queryKey: ['dashboardMetrics'],
        queryFn: () => {
            if (!session?.access_token) {
                // This case should be handled by `enabled` but as a safeguard:
                throw new Error("Not authenticated");
            }
            return getDashboardMetrics(session.access_token);
        },
        // Only run the query if the auth session has been initialized and a session exists
        enabled: !isAuthLoading && !!session,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: (failureCount, err: any) => {
            if (err.message?.includes('401') || err.message?.includes('403')) {
                return false; // Do not retry on auth errors
            }
            return failureCount < 3;
        },
    });

    // Handle side-effects from query state
    useEffect(() => {
        if (isError) {
            if (error?.message.includes('401')) {
                router.push('/sign-in?redirect=/admin');
            } else if (error?.message.includes('403')) {
                router.push('/forbidden');
            }
        }
    }, [isError, error, router]);


  if (isLoading || isAuthLoading) {
    return <DashboardSkeleton />;
  }
  
  if (isError) {
    // Let the useEffect handle redirection for auth errors.
    // For other errors, show a message.
    if (error?.message.includes('401') || error?.message.includes('403')) {
        return <div className="p-4">Redirecting...</div>
    }
    return (
        <div className="p-4">
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error?.message || "An unknown error occurred while fetching dashboard data."}</AlertDescription>
            </Alert>
        </div>
    );
  }

  if (!metrics) {
    return <div className="p-4">Could not load dashboard data.</div>;
  }

  // Format data for charts
  const formattedAppointmentsByStatus = metrics.aggregates.appointmentsByStatus.map(item => ({
      name: item.status,
      value: item.count
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
            An overview of platform activity and key metrics.
        </p>
      </div>
      {/* Core Counts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{metrics.coreCounts.users}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{metrics.coreCounts.doctors}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clinics</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{metrics.coreCounts.clinics}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{metrics.coreCounts.appointments}</div></CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>Appointments in the Last 30 Days</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={metrics.timeSeries.appointmentsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" stroke={BRAND_COLORS.muted} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke={BRAND_COLORS.muted} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill={BRAND_COLORS.primary} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Appointments by Status</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie data={formattedAppointmentsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill={BRAND_COLORS.primary} label>
                            {formattedAppointmentsByStatus.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

      {/* Top Lists */}
       <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Top 5 Most Booked Services</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {metrics.aggregates.topServices.map((service, index) => (
                            <li key={index} className="flex justify-between text-sm">
                                <span>{service.serviceName}</span>
                                <span className="font-semibold">{service.count}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Top 5 Busiest Clinics</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {metrics.aggregates.topClinics.map((clinic, index) => (
                            <li key={index} className="flex justify-between text-sm">
                                <span>{clinic.clinicName}</span>
                                <span className="font-semibold">{clinic.count}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

const DashboardSkeleton = () => (
    <div className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
            <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-[350px] w-full" /></CardContent></Card>
            <Card className="lg:col-span-3"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-[350px] w-full" /></CardContent></Card>
        </div>
    </div>
) 