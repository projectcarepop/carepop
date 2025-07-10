import { Card, CardContent } from "@/components/ui/card";
import { AppointmentsClient } from "./_components/AppointmentsClient";
import { getAdminAppointments } from "@/services/api";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function AdminAppointmentsPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check authentication before proceeding
    if (!session) {
        redirect('/sign-in?redirect=/admin/appointments');
    }

    try {
        // We fetch initial data on the server for faster page load and SEO.
        // The client-side react-query will take over from here.
        const initialAppointments = await getAdminAppointments(session.access_token, { limit: 10 });

        return (
            <Card>
                <CardContent className="pt-6">
                    <AppointmentsClient initialAppointments={initialAppointments} />
                </CardContent>
            </Card>
        );
    } catch (error: any) {
        console.error(`[AdminAppointmentsPage] Error fetching appointments:`, error);
        if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
            redirect('/forbidden');
        }

        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Failed to Load Appointments</AlertTitle>
                    <AlertDescription>
                        <p>There was an error fetching the appointments data from the server.</p>
                        <p className="mt-2 font-mono text-xs">Error: {error.message}</p>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
}
