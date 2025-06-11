'use client';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Hospital, Settings, CalendarCheck, Clock, AlertTriangle, CalendarClock } from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/actions/dashboard.admin.actions";
import PendingAppointments from './PendingAppointments';
import { cn } from '@/lib/utils';

// Helper component for statistics cards
type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ElementType;
  link: string;
  critical?: boolean;
};

const StatCard = ({ title, value, icon: Icon, link, critical = false }: StatCardProps) => (
  <Link href={link} className="block">
    <Card
      className={cn(
        "transition-all hover:-translate-y-1 hover:shadow-lg",
        critical && Number(value) > 0 
          ? "border-destructive bg-destructive/10 hover:bg-destructive/20" 
          : "hover:bg-accent/50"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={cn(
          "text-sm font-medium",
          critical && Number(value) > 0 && "text-destructive"
        )}>
          {title}
        </CardTitle>
        <Icon className={cn(
            "h-5 w-5 text-muted-foreground",
            critical && Number(value) > 0 && "text-destructive"
        )} />
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-3xl font-bold",
           critical && Number(value) > 0 && "text-destructive"
        )}>
          {value}
        </div>
      </CardContent>
    </Card>
  </Link>
);


// Async component to fetch and display stats
async function Stats() {
    const statsResponse = await getDashboardStats();
    // Provide a fallback for stats data
    const stats = statsResponse?.data || {
        appointmentsTodayCount: 0,
        pendingAppointmentsCount: 0,
        futureAppointmentsCount: 0,
        inventoryAlertsCount: 0,
        totalClinics: 0,
        totalProviders: 0,
        totalServices: 0,
        pendingAppointments: []
    };
    
    const pendingAppointments = stats.pendingAppointments || [];

    const statsCards = [
        { title: "Upcoming (Today)", value: stats.appointmentsTodayCount, icon: CalendarCheck, link: "/admin/appointments" },
        { title: "Pending", value: stats.pendingAppointmentsCount, icon: Clock, link: "/admin/appointments" },
        { title: "Total Future", value: stats.futureAppointmentsCount, icon: CalendarClock, link: "/admin/appointments" },
        { title: "Inventory Alerts", value: stats.inventoryAlertsCount, icon: AlertTriangle, critical: true, link: "/admin/inventory" },
        { title: "Total Clinics", value: stats.totalClinics, icon: Hospital, link: "/admin/clinics" },
        { title: "Total Providers", value: stats.totalProviders, icon: Users, link: "/admin/providers" },
        { title: "Total Services", value: stats.totalServices, icon: Settings, link: "/admin/services" },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {statsCards.map(card => (
                   <StatCard key={card.title} {...card} />
                ))}
            </div>
            <PendingAppointments appointments={pendingAppointments} />
        </div>
    );
}
     
// Main page component
export default function AdminDashboard() {
    return (
        <div className="flex flex-col gap-6">
             <div>
                <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome to the Admin Dashboard. This is your central hub for managing the carepop platform. From here, you can manage services, oversee providers, view user information (with appropriate permissions), manage inventory, and generate reports to ensure the smooth operation and impact of our healthcare services.
                </p>
            </div>
            <Suspense fallback={<p className="text-muted-foreground">Loading dashboard stats...</p>}>
                <Stats />
            </Suspense>
        </div>
    );
} 