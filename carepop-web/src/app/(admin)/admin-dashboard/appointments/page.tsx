import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { apiClient } from '@/lib/apiClient';
import { AppointmentsClient } from '@/components/admin-dashboard/appointments/AppointmentsClient';

// These types would ideally be in a shared location, e.g., @/types/app
export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  clinicName: string;
  serviceName: string;
  startTime: string;
  status: 'scheduled' | 'completed' | 'canceled';
}
export interface Clinic {
  id: string;
  name: string;
}
export interface Doctor {
  id: string;
  fullName: string;
}

async function fetchData(accessToken: string) {
    try {
        const [aptsRes, clinicsRes, doctorsRes] = await Promise.all([
            apiClient.api.admin.appointments.$get({ headers: { 'Authorization': `Bearer ${accessToken}` } }),
            apiClient.api.admin.clinics.$get({ headers: { 'Authorization': `Bearer ${accessToken}` } }),
            apiClient.api.admin.doctors.$get({ headers: { 'Authorization': `Bearer ${accessToken}` } }),
        ]);

        const appointments = aptsRes.ok ? (await aptsRes.json()).data : [];
        const clinics = clinicsRes.ok ? (await clinicsRes.json()).data : [];
        const doctors = doctorsRes.ok ? (await doctorsRes.json()).data : [];
        
        return { appointments, clinics, doctors };
    } catch (error) {
        console.error('An unexpected error occurred while fetching appointments data:', error);
        return { appointments: [], clinics: [], doctors: [] };
    }
}

export default async function ManageAppointmentsPage() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return null;
    
    const { appointments, clinics, doctors } = await fetchData(session.access_token);
    
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