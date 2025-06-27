import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getAppointmentDetails } from '@/services/api'; // Assuming this function exists
import { notFound, redirect } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default async function AppointmentDetailPage({ params }: { params: { appointmentId: string } }) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        redirect(`/sign-in?redirect=/admin/appointments/${params.appointmentId}`);
    }

    try {
        // This function will need to be created in services/api.ts
        const appointment = await getAppointmentDetails(params.appointmentId, session.access_token);
        if (!appointment) {
            notFound();
        }

        return (
            <div className="container mx-auto p-4">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Appointment Details</CardTitle>
                                <CardDescription>ID: {appointment.id}</CardDescription>
                            </div>
                            <Badge variant={appointment.status.startsWith('canceled') ? 'destructive' : 'default'}>{appointment.status}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-lg">Patient Information</h3>
                                <Separator className="my-2"/>
                                <p><strong>Name:</strong> {appointment.patientName}</p>
                            </div>
                             <div>
                                <h3 className="font-semibold text-lg">Appointment Information</h3>
                                <Separator className="my-2"/>
                                <p><strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleString()}</p>
                                <p><strong>Service:</strong> {appointment.serviceName}</p>
                                <p><strong>Clinic:</strong> {appointment.clinicName}</p>
                                <p><strong>Doctor:</strong> {appointment.doctorName}</p>
                            </div>
                        </div>

                        {/* Future section for medical notes */}
                        <div>
                            <h3 className="font-semibold text-lg">Medical Notes</h3>
                             <Separator className="my-2"/>
                            <p className="text-muted-foreground">No medical notes recorded for this appointment yet.</p>
                            {/* Form to add notes would go here */}
                        </div>

                    </CardContent>
                    <CardFooter>
                        <p className="text-xs text-muted-foreground">
                           Appointment created at {new Date(appointment.createdAt).toLocaleString()}
                        </p>
                    </CardFooter>
                </Card>
            </div>
        );

    } catch (error) {
        console.error("Failed to fetch appointment details:", error);
        return <div className="text-red-500 p-4">Error loading appointment details.</div>;
    }
} 