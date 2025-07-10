import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getAppointmentDetails } from '@/services/api'; 
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { ArrowLeft, Terminal, Calendar, User, Building2, Stethoscope, FileText } from 'lucide-react';
import { MedicalRecordList } from './_components/MedicalRecordList';

interface AppointmentDetailsPageProps {
    params: {
        appointmentId: string;
    };
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case 'scheduled':
            return "secondary";
        case 'canceled_by_admin':
        case 'canceled_by_patient':
            return "destructive";
        case 'completed':
            return "outline";
        case 'no_show':
            return "destructive";
        default:
            return "default";
    }
}

export default async function AppointmentDetailsPage({ params }: AppointmentDetailsPageProps) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        redirect(`/sign-in?redirect=/admin/appointments/${params.appointmentId}`);
    }

    try {
        const response = await getAppointmentDetails(params.appointmentId, session.access_token);
        
        if (response.error || !response.data) {
            if (response.error?.includes('not found')) {
                notFound();
            }
            throw new Error(response.error || 'Appointment not found');
        }

        const appointment = response.data;

        return (
            <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-4xl">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/appointments" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Appointments
                        </Link>
                    </Button>
                </div>

                {/* Main Appointment Details Card */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Appointment Details
                                </CardTitle>
                                <CardDescription>
                                    {format(new Date(appointment.appointmentTime), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
                                </CardDescription>
                            </div>
                            <Badge variant={getStatusBadgeVariant(appointment.status)}>
                                {appointment.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Patient Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Patient Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <span className="font-medium text-gray-600">Name:</span>
                                        <p className="text-gray-900">{appointment.patient.fullName}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Email:</span>
                                        <p className="text-gray-900">{appointment.patient.email}</p>
                                    </div>
                                    {appointment.patient.contactNo && (
                                        <div>
                                            <span className="font-medium text-gray-600">Phone:</span>
                                            <p className="text-gray-900">{appointment.patient.contactNo}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Clinic & Doctor Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Building2 className="h-4 w-4" />
                                        Healthcare Provider
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <span className="font-medium text-gray-600">Clinic:</span>
                                        <p className="text-gray-900">{appointment.clinic.name}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-600">Doctor:</span>
                                        <p className="text-gray-900">{appointment.doctor.fullName}</p>
                                    </div>
                                    {appointment.clinic.phoneNumber && (
                                        <div>
                                            <span className="font-medium text-gray-600">Clinic Phone:</span>
                                            <p className="text-gray-900">{appointment.clinic.phoneNumber}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Service Information */}
                            <Card className="md:col-span-2">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Stethoscope className="h-4 w-4" />
                                        Service Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div>
                                        <span className="font-medium text-gray-600">Service:</span>
                                        <p className="text-gray-900">{appointment.service.name}</p>
                                    </div>
                                    {appointment.service.description && (
                                        <div>
                                            <span className="font-medium text-gray-600">Description:</span>
                                            <p className="text-gray-900">{appointment.service.description}</p>
                                        </div>
                                    )}
                                    {appointment.reasonForVisit && (
                                        <div>
                                            <span className="font-medium text-gray-600">Reason for Visit:</span>
                                            <p className="text-gray-900">{appointment.reasonForVisit}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-medium text-gray-600">Duration:</span>
                                        <p className="text-gray-900">{appointment.service.durationMinutes} minutes</p>
                                    </div>
                                    {appointment.service.price && (
                                        <div>
                                            <span className="font-medium text-gray-600">Price:</span>
                                            <p className="text-gray-900">₱{parseFloat(appointment.service.price).toLocaleString()}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                {/* Medical Records Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Medical Records
                        </CardTitle>
                        <CardDescription>
                            Records and documents associated with this appointment
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MedicalRecordList 
                            appointmentId={params.appointmentId} 
                            initialRecords={appointment.medicalRecords || []}
                        />
                    </CardContent>
                </Card>
            </div>
        );
    } catch (error: any) {
        console.error(`[AppointmentDetailsPage] Error fetching appointment:`, error);
        
        if (error.message?.includes('Forbidden') || error.message?.includes('Unauthorized')) {
            redirect('/forbidden');
        }

        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Failed to Load Appointment</AlertTitle>
                    <AlertDescription>
                        <p>There was an error fetching the appointment details from the server.</p>
                        <p className="mt-2 font-mono text-xs">Error: {error.message}</p>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
} 