import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AppointmentPageClient from './components/AppointmentPageClient';
import { redirect } from 'next/navigation';

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
  };
}) {
  const { clinicId } = searchParams;

  const clinics = await getClinics();
  
  // Redirect to the first clinic if none is selected in the URL
  if (clinics.length > 0 && !clinicId) {
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('clinicId', clinics[0].id);
    return redirect(`/admin/appointments?${newSearchParams.toString()}`);
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

  const selectedClinicId = clinicId ?? (clinics.length > 0 ? clinics[0].id : null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Appointments Management</h1>
          <p className="text-muted-foreground">
              View, manage, and schedule all patient appointments across your clinics.
          </p>
      </div>

      <AppointmentPageClient 
        clinics={clinics} 
        initialClinicId={selectedClinicId}
      />
    </div>
  )
}