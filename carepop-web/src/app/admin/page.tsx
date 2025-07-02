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
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminDashboardPage() {
    const router = useRouter();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // This is a client component, so we can't use `cookies()` directly.
        // We will need to create an API route handler to proxy the request.
        // For now, let's just fetch from a new proxy endpoint.
        const fetchMetrics = async () => {
            setIsLoading(true);
            try {
                // We'll create this proxy route next
                const response = await fetch('/api/admin/metrics'); 
                if (!response.ok) {
                    if (response.status === 401) {
                        router.push('/sign-in?redirect=/admin');
                        return;
                    }
                    if (response.status === 403) {
                        router.push('/forbidden');
                        return;
                    }
                    const err = await response.json();
                    throw new Error(err.message || "Failed to fetch metrics");
                }
                const data = await response.json();
                setMetrics(data);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
    }, [router]);

  if (isLoading) {
    return <div className="p-4">Loading dashboard data...</div>;
  }
  
  if (error) {
    // A simple error display, could be enhanced with a proper component
    return <div className="p-4 text-red-500">Error: {error}</div>;
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
                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#adfa1d" radius={[4, 4, 0, 0]} />
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
                        <Pie data={formattedAppointmentsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" label>
                            {formattedAppointmentsByStatus.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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