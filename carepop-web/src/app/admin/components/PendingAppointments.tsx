'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

// This type is an assumption based on the backend service modification.
// It might need adjustment once the DB schema is finalized.
type Appointment = {
    id: string;
    created_at: string;
    status: string;
    patients: { fullName: string } | null;
    services: { name: string } | null;
}

export default function PendingAppointments({ appointments }: { appointments: Appointment[] }) {

    if (appointments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Pending Appointments</CardTitle>
                    <CardDescription>
                        Appointments that require review and confirmation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <p>No pending appointments right now.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending Appointments</CardTitle>
                <CardDescription>
                    These are the oldest appointments that require review and confirmation.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {appointments.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg shadow-sm dark:bg-zinc-800">
                        <div className="flex flex-col">
                           <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                             {app.patients?.fullName ?? 'Unknown Patient'}
                           </p>
                           <p className="text-sm text-muted-foreground">
                             {app.services?.name ?? 'Unknown Service'}
                           </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-400/20 dark:bg-amber-900/30">
                                <Clock className="mr-1 h-3 w-3" />
                                {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                            </Badge>
                             <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300">
                                In Review
                            </Badge>
                            <Button asChild variant="ghost" size="sm">
                                <Link href={`/admin/appointments/${app.id}`}>
                                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
} 