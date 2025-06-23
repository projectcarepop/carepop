import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AppointmentTable } from './components/AppointmentTable';
import ClinicSelector from './components/ClinicSelector';

export const dynamic = 'force-dynamic';

async function getClinics() {
    const supabase = await createSupabaseServerClient();
    const { data: clinics, error } = await supabase
        .from('clinics')
        .select('id, name')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching clinics:', error);
        return [];
    }
    return clinics;
}

export default async function AdminAppointmentsPage({
  searchParams,
}: {
  searchParams: {
    clinicId?: string;
    page?: string;
    per_page?: string;
    sort?: string;
    searchTerm?: string;
  };
}) {
  const { clinicId } = searchParams;
  const clinics = await getClinics();
  
  // Redirect to the first clinic if no clinic is selected in the URL
  if (clinics.length > 0 && !clinicId) {
    return redirect(`/admin/appointments?clinicId=${clinics[0].id}`);
  }

  // Handle case where there are no clinics
  if (!clinics || clinics.length === 0) {
    return (
        <div className="flex flex-col w-full gap-4 items-center text-center p-8">
            <h1 className="text-2xl font-bold">Appointment Management</h1>
            <p className="text-muted-foreground">No clinics have been created yet.</p>
            <Button asChild>
                <Link href="/admin/clinics/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Clinic
                </Link>
            </Button>
        </div>
    )
  }

  const selectedClinicId = clinicId ?? clinics[0].id;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Appointments Management</h1>
            <p className="text-muted-foreground">
                View, manage, and schedule all patient appointments across your clinics.
            </p>
        </div>
        <Button asChild>
          <Link href="/admin/appointments/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Appointments</CardTitle>
          <CardDescription>Select a clinic to view its appointments.</CardDescription>
        </CardHeader>
        <CardContent>
            <ClinicSelector clinics={clinics} selectedClinicId={selectedClinicId} />
        </CardContent>
      </Card>

      <AppointmentTable searchParams={searchParams} />
    </div>
  )
}