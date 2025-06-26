import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AppointmentDetailPageProps {
    params: {
        appointmentId: string;
    };
}

export default async function AppointmentDetailPage({ params }: AppointmentDetailPageProps) {
    const { appointmentId } = params;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: appointment, error } = await supabase
        .from('appointments')
        .select(`
            *,
            profile:profiles (*),
            doctor:doctors (*),
            clinic:clinics (*),
            service:services (*)
        `)
        .eq('id', appointmentId)
        .single();

    if (error || !appointment) {
        notFound();
    }

    const patient = appointment.profile;
    const doctor = appointment.doctor;
    const clinic = appointment.clinic;
    const service = appointment.service;

    if (!patient || !doctor || !clinic || !service) {
        // Handle cases where relations might be null if the data integrity allows it
        return notFound();
    }

    const patientFullName = [patient.first_name, patient.last_name].filter(Boolean).join(' ');
    const doctorFullName = doctor.full_name;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Appointment Details</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {service.name} with {doctorFullName}
                        </p>
                    </div>
                    <Badge variant={appointment.status?.includes('canceled') ? 'destructive' : 'default'}>{appointment.status}</Badge>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                        <h3 className="font-semibold">When</h3>
                        <p>{format(new Date(appointment.appointment_date), 'PPPPpppp')}</p>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Where</h3>
                        <p>{clinic.name} - {clinic.address}</p>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Patient</h3>
                        <p>{patientFullName} ({patient.email})</p>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Price</h3>
                        <p>₱{service.price}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Medical Records for this Visit</h2>
                {/* <AddNoteModal appointmentId={appointment.id} />  TODO: Re-enable or refactor this client component */}
            </div>
            
            <div className="space-y-4">
                 <p className="text-center text-muted-foreground py-8">Medical records display has been temporarily disabled pending refactor.</p>
                {/* 
                TODO: Refactor medical records fetching and display
                {appointment.medicalRecords.length > 0 ? (
                    appointment.medicalRecords.map(record => <RecordCard key={record.id} record={record} />)
                ) : (
                    <p className="text-center text-muted-foreground py-8">No medical records found for this appointment.</p>
                )} */}
            </div>
        </div>
    );
}