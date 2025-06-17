import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AppointmentPageClient from './components/AppointmentPageClient';
import { AppointmentTable } from './components/AppointmentTable';
import { redirect } from 'next/navigation';

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
  searchParams: { clinicId?: string, page?: string, per_page?: string, sort?: string, search?: string };
}) {
  const clinics = await getClinics();
  const selectedClinicId = searchParams.clinicId ?? (clinics.length > 0 ? clinics[0].id : null);
  
  if (clinics.length > 0 && !searchParams.clinicId) {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('clinicId', clinics[0].id);
    redirect(`/admin/appointments?${newSearchParams.toString()}`);
  }

  if (!clinics || clinics.length === 0) {
    return (
        <div className="flex flex-col w-full gap-4 items-center text-center">
            <h1 className="text-2xl font-bold">Appointment Management</h1>
            <p className="text-muted-foreground">No clinics found.</p>
            <Button asChild>
                <Link href="/admin/clinics/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add First Clinic
                </Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Appointments</h1>
        <Button asChild>
          <Link href="/admin/appointments/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </div>
      <AppointmentPageClient 
        clinics={clinics} 
        initialClinicId={selectedClinicId}
        table={
            <AppointmentTable 
                clinicId={selectedClinicId!} 
                page={searchParams.page ? parseInt(searchParams.page) : 1}
                per_page={searchParams.per_page ? parseInt(searchParams.per_page) : 10}
                sort={searchParams.sort}
                search={searchParams.search}
            />
        }
      />
    </div>
  )
} 