import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getAdminAppointments, getAdminClinics, getAdminDoctors } from '@/services/api';
import { AppointmentsClient } from '@/components/admin-dashboard/appointments/AppointmentsClient';

export default async function ManageAppointmentsPage() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const [
        appointmentsData,
        clinicsData,
        doctorsData
    ] = await Promise.all([
        getAdminAppointments(supabase, {}), // Pass empty filter object for now
        getAdminClinics(supabase),
        getAdminDoctors(supabase)
    ]);

    const appointments = appointmentsData || [];
    const clinics = clinicsData || [];
    const doctors = doctorsData || [];
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Manage Appointments</h1>
                <p className="text-muted-foreground">
                    Monitor and view all appointments on the platform.
                </p>
            </div>
            <AppointmentsClient 
                initialAppointments={appointments}
                clinics={clinics}
                doctors={doctors}
            />
        </div>
    );
} 