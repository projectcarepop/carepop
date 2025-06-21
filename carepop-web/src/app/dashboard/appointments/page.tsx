'use client';

import useSWR from 'swr';
import { UserAppointmentDetails } from "@/lib/types/appointmentTypes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppointmentCard from "@/components/appointments/AppointmentCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CalendarClock, CalendarCheck2 } from "lucide-react";
import { useAuth, useUser } from '@clerk/nextjs';

const AppointmentList = ({ appointments, isLoading, error, emptyState }: {
    appointments?: UserAppointmentDetails[];
    isLoading: boolean;
    error?: Error;
    emptyState: { icon: React.ElementType; title: string; description: string; };
}) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Failed to load appointments. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    if (!appointments || appointments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                <emptyState.icon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-800 dark:text-gray-200">{emptyState.title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{emptyState.description}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {appointments.map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
        </div>
    );
};

export default function MyAppointmentsPage() {
    const { user, isLoaded: isUserLoaded } = useUser();
    const { getToken } = useAuth();
    
    const fetcher = async (url: string) => {
        const token = await getToken();
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const error = new Error('An error occurred while fetching the data.');
            // Attach extra info to the error object.
            try {
                (error as any).info = await res.json();
            } catch {
                (error as any).info = { message: res.statusText };
            }
            (error as any).status = res.status;
            throw error;
        }

        const result = await res.json();
        return result.data;
    };

    const { data: appointments, error, isLoading } = useSWR<UserAppointmentDetails[]>(
        user ? `/api/v1/public/users/${user.id}/appointments` : null,
        fetcher,
        { shouldRetryOnError: false } // Optional: prevent retries on auth errors
    );

    const now = new Date();
    const futureAppointments = appointments?.filter(a => new Date(a.appointment_time) >= now);
    const pastAppointments = appointments?.filter(a => new Date(a.appointment_time) < now);

    if (!isUserLoaded) {
        return (
            <div className="container mx-auto py-10 px-4">
                <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">My Appointments</h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                    View your upcoming and past appointment details.
                </p>
            </header>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming" className="mt-6">
                    <AppointmentList 
                        appointments={futureAppointments}
                        isLoading={isLoading}
                        error={error}
                        emptyState={{
                            icon: CalendarClock,
                            title: "No Upcoming Appointments",
                            description: "You don't have any appointments scheduled."
                        }}
                    />
                </TabsContent>
                <TabsContent value="past" className="mt-6">
                    <AppointmentList
                        appointments={pastAppointments}
                        isLoading={isLoading}
                        error={error}
                        emptyState={{
                            icon: CalendarCheck2,
                            title: "No Past Appointments",
                            description: "You haven't had any appointments with us yet."
                        }}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
} 