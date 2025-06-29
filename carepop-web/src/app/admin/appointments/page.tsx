import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getAdminAppointments } from '@/services/api';
import AppointmentsClient from './_components/AppointmentsClient';

export default async function AdminAppointmentsPage() {
    // 1. Consolidate all data fetching logic directly into the page component.
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return <div className="p-4 text-red-500">Error: Not authenticated</div>;
    }
    
    try {
        const appointments = await getAdminAppointments(session.access_token);
        // The data fetching logic is now self-contained within the component.
        return <AppointmentsClient initialAppointments={appointments} />;
    } catch (error: any) {
        console.error("Failed to fetch admin appointments:", error.message);
        return <div className="p-4 text-red-500">Error: {error.message}</div>;
    }
}
