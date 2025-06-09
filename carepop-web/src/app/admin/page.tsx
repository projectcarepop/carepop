import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Hospital, Settings, CalendarCheck, Clock, AlertTriangle, CalendarClock } from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/actions/dashboard.admin.actions";
import PendingAppointments from './components/PendingAppointments';

async function Stats() {
    const statsResponse = await getDashboardStats();
    const stats = statsResponse?.data || {};
    const pendingAppointments = stats.pendingAppointments || [];

    const statsCards = [
        { title: "Upcoming Appointments (Today)", value: stats.appointmentsTodayCount ?? 0, icon: CalendarCheck, description: "Confirmed for today.", link: "/admin/appointments" },
        { title: "Pending Appointments", value: stats.pendingAppointmentsCount ?? 0, icon: Clock, description: "Awaiting confirmation.", link: "/admin/appointments" },
        { title: "Total Future Appointments", value: stats.futureAppointmentsCount ?? 0, icon: CalendarClock, description: "All upcoming.", link: "/admin/appointments" },
        { title: "Inventory Alerts", value: stats.inventoryAlertsCount ?? 0, icon: AlertTriangle, description: "Items out of stock.", critical: true, link: "/admin/inventory" },
        { title: "Total Clinics", value: stats.totalClinics ?? 0, icon: Hospital, description: "Clinics in system.", link: "/admin/clinics" },
        { title: "Total Providers", value: stats.totalProviders ?? 0, icon: Users, description: "Registered providers.", link: "/admin/providers" },
        { title: "Total Services", value: stats.totalServices ?? 0, icon: Settings, description: "Unique services.", link: "/admin/services" },
    ]

    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                {statsCards.map(card => (
                    <Link key={card.title} href={card.link || '#'} className="group">
                        <Card className={`h-full transition-all group-hover:shadow-lg ${card.critical && card.value > 0 ? "border-destructive bg-destructive/5" : "hover:bg-muted"}`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                                <card.icon className={`h-4 w-4 text-muted-foreground ${card.critical && card.value > 0 ? "text-destructive" : ""}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{card.value}</div>
                                <p className="text-xs text-muted-foreground">{card.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
            <PendingAppointments appointments={pendingAppointments} />
        </div>
    );
}

export default function AdminDashboardPage() {
    return (
        <div className="flex flex-col gap-6">
             <div>
                <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome to the Admin Dashboard. This is your central hub for managing the CarePoP/QueerCare platform. From here, you can manage services, oversee providers, view user information (with appropriate permissions), manage inventory, and generate reports to ensure the smooth operation and impact of our healthcare services.
                </p>
            </div>
            <Suspense fallback={<p>Loading stats...</p>}>
                <Stats />
            </Suspense>
        </div>
    );
} 