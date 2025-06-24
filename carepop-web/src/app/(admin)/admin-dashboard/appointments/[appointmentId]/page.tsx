import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { apiClient } from '@/lib/apiClient';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AddNoteModal } from '@/components/admin-dashboard/appointments/AddNoteModal';

// --- Types ---
interface MedicalRecord {
    id: string;
    recordType: 'PRESCRIPTION' | 'NOTE' | 'TEST_RESULT';
    details: Record<string, any>;
    createdAt: string;
}
interface AppointmentDetails {
    id: string;
    startTime: string;
    status: 'scheduled' | 'completed' | 'canceled';
    patient: { fullName: string; email: string; };
    doctor: { fullName: string; };
    clinic: { name: string; address: string; };
    service: { name: string; price: number; };
    medicalRecords: MedicalRecord[];
}

// --- Data Fetching ---
async function getAppointmentDetails(appointmentId: string, accessToken: string): Promise<AppointmentDetails | null> {
    try {
        const res = await apiClient.api.admin.appointments[appointmentId].$get({
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (!res.ok) return null;
        const { data } = await res.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch appointment details:', error);
        return null;
    }
}

// --- Helper Components ---
function RecordCard({ record }: { record: MedicalRecord }) {
    let content = null;
    switch(record.recordType) {
        case 'NOTE':
        case 'DOCTOR_NOTE':
            content = <p>{record.details?.content}</p>;
            break;
        case 'PRESCRIPTION':
            content = (
                <ul className="list-disc pl-5">
                    {record.details?.medications?.map((med: any) => (
                        <li key={med.name}>{med.name} - {med.dosage} ({med.instructions})</li>
                    ))}
                </ul>
            );
            break;
        default:
            content = <pre className="whitespace-pre-wrap break-all">{JSON.stringify(record.details, null, 2)}</pre>;
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium uppercase">{record.recordType.replace('_', ' ')}</CardTitle>
                <p className="text-xs text-muted-foreground">{format(new Date(record.createdAt), 'PPpp')}</p>
            </CardHeader>
            <CardContent>{content}</CardContent>
        </Card>
    );
}

// --- Page Component ---
export default async function AppointmentDetailPage({ params }: { params: { appointmentId: string } }) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return notFound();

    const appointment = await getAppointmentDetails(params.appointmentId, session.access_token);
    if (!appointment) return notFound();

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Appointment Details</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {appointment.service.name} with {appointment.doctor.fullName}
                        </p>
                    </div>
                     <Badge variant={appointment.status === 'canceled' ? 'destructive' : 'default'}>{appointment.status}</Badge>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <h3 className="font-semibold">When</h3>
                        <p>{format(new Date(appointment.startTime), 'PPPPpppp')}</p>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Where</h3>
                        <p>{appointment.clinic.name} - {appointment.clinic.address}</p>
                    </div>
                     <div className="space-y-1">
                        <h3 className="font-semibold">Patient</h3>
                        <p>{appointment.patient.fullName} ({appointment.patient.email})</p>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Price</h3>
                        <p>₱{appointment.service.price}</p>
                    </div>
                </CardContent>
             </Card>

             <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Medical Records for this Visit</h2>
                <AddNoteModal appointmentId={appointment.id} />
             </div>
             
             <div className="space-y-4">
                {appointment.medicalRecords.length > 0 ? (
                    appointment.medicalRecords.map(record => <RecordCard key={record.id} record={record} />)
                ) : (
                    <p className="text-center text-muted-foreground py-8">No medical records found for this appointment.</p>
                )}
             </div>
        </div>
    );
} 