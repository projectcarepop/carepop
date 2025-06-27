import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getAdminAppointments } from '@/services/api';
import AppointmentsClient from './_components/AppointmentsClient';

async function getAdminAppointmentsData() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        console.log("No session found, cannot fetch appointments.");
        return { appointments: [], error: 'Not authenticated' };
    }
    
    try {
        const appointments = await getAdminAppointments(session.access_token);
        console.log(`[Admin Appointments Page] Passing ${appointments.length} appointments to the client component.`);
        console.log("[Admin Appointments Page] Sample record:", JSON.stringify(appointments[0], null, 2));
        return { appointments, error: null };
    } catch (error: any) {
        console.error("Failed to fetch admin appointments:", error.message);
        return { appointments: [], error: error.message };
    }
}

export default async function AdminAppointmentsPage() {
    const cookieStore = cookies();
    const { appointments, error } = await getAdminAppointmentsData(cookieStore);

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    return <AppointmentsClient initialAppointments={appointments} />;
}
