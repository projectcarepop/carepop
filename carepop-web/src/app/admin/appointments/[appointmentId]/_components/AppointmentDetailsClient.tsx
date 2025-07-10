'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAppointmentDetails } from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter } from 'next/navigation';
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
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ArrowLeft, Terminal, Calendar, User, Building2, Stethoscope, FileText } from 'lucide-react';
import { MedicalRecordList } from './MedicalRecordList';

interface AppointmentDetailsClientProps {
    appointmentId: string;
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

// Helper function to format date safely (prevent hydration issues)
function formatAppointmentDate(dateString: string) {
    try {
        const date = new Date(dateString);
        return format(date, 'EEEE, MMMM d, yyyy \'at\' h:mm a');
    } catch {
        return 'Invalid Date';
    }
}

export function AppointmentDetailsClient({ appointmentId }: AppointmentDetailsClientProps) {
    const { session } = useAuth();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    // Prevent hydration issues
    useEffect(() => {
        setIsClient(true);
    }, []);

    const { data: response, isLoading, error } = useQuery({
        queryKey: ['appointment-details', appointmentId],
        queryFn: () => getAppointmentDetails(appointmentId, session?.access_token || ''),
        enabled: !!session?.access_token,
        refetchOnWindowFocus: false,
    });

    if (!session) {
        router.push(`/sign-in?redirect=/admin/appointments/${appointmentId}`);
        return null;
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-4xl">
                <Skeleton className="h-8 w-48" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <Skeleton className="h-32" />
                            <Skeleton className="h-32" />
                            <Skeleton className="h-24 md:col-span-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || response?.error || !response?.data) {
        return (
            <div className="container mx-auto p-4">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Failed to Load Appointment</AlertTitle>
                    <AlertDescription>
                        <p>There was an error fetching the appointment details from the server.</p>
                        <p className="mt-2 font-mono text-xs">
                            Error: {error?.message || response?.error || 'Unknown error'}
                        </p>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const appointment = response.data;

    // Don't render detailed content until client-side hydration is complete
    if (!isClient) {
        return (
            <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-4xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin/appointments" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Appointments
                        </Link>
                    </Button>
                </div>
                <div>Loading appointment details...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 max-w-7xl">
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
                                {formatAppointmentDate(appointment.appointmentTime)}
                            </CardDescription>
                        </div>
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
                            {appointment.status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 lg:grid-cols-3">
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
                                    <p className="text-gray-900">{appointment.patientName || 'Unknown Patient'}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">Appointment ID:</span>
                                    <p className="text-gray-900 font-mono text-sm">{appointment.id}</p>
                                </div>
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
                                    <p className="text-gray-900">{appointment.clinicName || 'Unknown Clinic'}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">Doctor:</span>
                                    <p className="text-gray-900">{appointment.doctorName || 'Unknown Doctor'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Service Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4" />
                                    Service Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div>
                                    <span className="font-medium text-gray-600">Service:</span>
                                    <p className="text-gray-900">{appointment.serviceName || 'Unknown Service'}</p>
                                </div>
                                {appointment.reasonForVisit && (
                                    <div>
                                        <span className="font-medium text-gray-600">Reason for Visit:</span>
                                        <p className="text-gray-900">{appointment.reasonForVisit}</p>
                                    </div>
                                )}
                                {appointment.servicePrice && (
                                    <div>
                                        <span className="font-medium text-gray-600">Price:</span>
                                        <p className="text-gray-900">₱{parseFloat(appointment.servicePrice).toLocaleString()}</p>
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
                        appointmentId={appointmentId} 
                        initialRecords={[]}
                    />
                </CardContent>
            </Card>
        </div>
    );
} 