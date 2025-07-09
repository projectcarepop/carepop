import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getAppointmentDetails } from '@/services/api'; 
import { notFound, redirect } from 'next/navigation';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default async function AppointmentDetailsPage({ params }: { params: { appointmentId: string } }) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        redirect(`/sign-in?redirect=/admin/appointments/${params.appointmentId}`);
    }

    const { data: appointment, error } = await getAppointmentDetails(params.appointmentId, session.access_token);

    if (error || !appointment) {
        if (error?.includes('not found')) {
            notFound();
        }
        return <div className="p-4 text-red-500">Error: {error || 'Appointment not found.'}</div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Appointment Details</CardTitle>
                            <CardDescription>Details for appointment on {format(new Date(appointment.appointmentTime), 'PPP p')}</CardDescription>
                        </div>
                        <Badge>{appointment.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <h3 className="font-semibold">Patient Information</h3>
                        <p><strong>Name:</strong> {appointment.patient.fullName}</p>
                        <p><strong>Email:</strong> {appointment.patient.email}</p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold">Clinic & Doctor</h3>
                        <p><strong>Clinic:</strong> {appointment.clinic.name}</p>
                        <p><strong>Doctor:</strong> {appointment.doctor.fullName}</p>
                    </div>
                    <div className="space-y-2 col-span-2">
                        <h3 className="font-semibold">Service Details</h3>
                        <p><strong>Service:</strong> {appointment.service.name}</p>
                        <p><strong>Reason for Visit:</strong> {appointment.reasonForVisit || 'N/A'}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 