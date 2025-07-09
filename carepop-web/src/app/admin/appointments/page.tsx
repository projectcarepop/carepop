import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getAdminAppointments } from '@/services/api';
import { AppointmentsClient } from './_components/AppointmentsClient';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default async function AdminAppointmentsPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        // Use redirect for server components as per Next.js best practices
        redirect('/sign-in?redirect=/admin/appointments');
    }
    
    try {
        const appointments = await getAdminAppointments(session.access_token);
        return <AppointmentsClient initialAppointments={appointments} />;
    } catch (error: any) {
        console.error("Failed to fetch admin appointments:", error.message);
        
        // Use the standard Alert component for displaying errors
        return (
            <div className="p-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Fetching Appointments</AlertTitle>
                    <AlertDescription>
                        {error.message || "An unexpected error occurred. Please try again later."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
}
