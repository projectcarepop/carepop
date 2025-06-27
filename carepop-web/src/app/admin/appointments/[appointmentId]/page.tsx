import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MedicalRecordList } from './_components/MedicalRecordList';
import AccessDenied from '@/components/layout/AccessDenied';
import type { AppointmentWithRelations, Profile } from '@/lib/types';

export default async function AppointmentDetailPage({ params }: { params: { appointmentId: string } }) {
  // ALL LOGIC IS NOW INSIDE THE COMPONENT
  const { appointmentId } = params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Auth & Role Check
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/appointments/' + appointmentId);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single<Pick<Profile, 'role'>>();
    
  if (profile?.role !== 'admin') {
    return <AccessDenied pageName="this page because you are not an administrator" />;
  }

  // 2. Data Fetching
  let appointment: AppointmentWithRelations | null = null;
  let fetchError: string | null = null;
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) throw new Error("API URL is not configured.");

    const headers = { 'Authorization': `Bearer ${session.access_token}` };
    const response = await fetch(`${apiUrl}/api/admin/appointments/${appointmentId}`, { headers, cache: 'no-store' });
    
    if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.message || `HTTP Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    appointment = result.data; // The backend now correctly wraps the response in 'data'
  } catch (e: any) {
    console.error("Error fetching appointment details:", e);
    fetchError = e.message;
  }

  // 3. Render Logic
  if (fetchError) {
    return <AccessDenied pageName={`this appointment due to an error: ${fetchError}`} />;
  }

  if (!appointment) {
    return <AccessDenied pageName="this appointment because it could not be found" />;
  }

  const patientName = `${appointment.patient?.firstName || ''} ${appointment.patient?.lastName || ''}`.trim();
  const appointmentDate = new Date(appointment.appointmentTime).toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <h1 className="text-3xl font-bold">Appointment Details</h1>
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Appointment #{appointment.id.substring(0, 8)}</CardTitle>
                        <CardDescription>
                            {appointmentDate}
                        </CardDescription>
                    </div>
                    <Badge variant={appointment.status === 'scheduled' ? 'default' : 'secondary'}>{appointment.status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Patient Information</h3>
                    <p><strong>Name:</strong> {patientName}</p>
                    <p><strong>Email:</strong> {appointment.patient?.email || 'N/A'}</p>
                    <p><strong>Contact:</strong> {appointment.patient?.contactNo || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Consultation Details</h3>
                    <p><strong>Clinic:</strong> {appointment.clinic?.name || 'N/A'}</p>
                    <p><strong>Doctor:</strong> {appointment.doctor?.fullName || 'N/A'}</p>
                    <p><strong>Service:</strong> {appointment.service?.name || 'N/A'}</p>
                </div>
            </CardContent>
        </Card>

        <Separator />
        
        <MedicalRecordList 
            initialRecords={appointment.medicalRecords || []} 
            appointmentId={appointment.id}
        />
    </div>
  );
} 