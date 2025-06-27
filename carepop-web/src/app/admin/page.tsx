import { cookies } from 'next/headers';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import {
  Users,
  Hospital,
  Stethoscope,
  Pill,
  Calendar,
  Package,
} from 'lucide-react';

// This is now an async Server Component
export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch all stats in parallel for performance
  const [
    userCount,
    clinicCount,
    doctorCount,
    serviceCount,
    appointmentCount,
    outOfStockCount,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('clinics').select('id', { count: 'exact', head: true }),
    supabase.from('doctors').select('id', { count: 'exact', head: true }),
    supabase.from('services').select('id', { count: 'exact', head: true }),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'scheduled'),
    supabase
      .from('inventory')
      .select('id', { count: 'exact', head: true })
      .eq('quantity', 0),
  ]);

  const stats = [
    {
      title: 'Total Users',
      value: userCount.count?.toLocaleString() ?? '0',
      icon: Users,
    },
    {
      title: 'Total Clinics',
      value: clinicCount.count?.toLocaleString() ?? '0',
      icon: Hospital,
    },
    {
      title: 'Total Doctors',
      value: doctorCount.count?.toLocaleString() ?? '0',
      icon: Stethoscope,
    },
    {
      title: 'Total Services',
      value: serviceCount.count?.toLocaleString() ?? '0',
      icon: Pill,
    },
    {
      title: 'Upcoming Appointments',
      value: appointmentCount.count?.toLocaleString() ?? '0',
      icon: Calendar,
    },
    {
      title: 'Products Out of Stock',
      value: outOfStockCount.count?.toLocaleString() ?? '0',
      icon: Package,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 