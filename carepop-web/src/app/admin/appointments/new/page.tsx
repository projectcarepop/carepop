import { NewAppointmentForm } from './components/NewAppointmentForm';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';

export default async function NewAppointmentPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  
  // Authorize user using the admin client for the role check
  const { data: role } = await supabaseAdmin.from('user_roles').select('role').eq('user_id', user.id).single();
  if (role?.role !== 'admin') {
      redirect('/forbidden');
  }

  // Fetch data using the admin client to bypass RLS
  const { data: clinicsData, error: clinicsError } = await supabaseAdmin
    .from('clinics')
    .select('id, name')
    .order('name');

  // Fetch patients using the RPC with the admin client
  const { data: patientsData, error: patientsError } = await supabaseAdmin
    .rpc('get_users_with_roles', { role_filter: 'user' });


  if (clinicsError || patientsError) {
    console.error('Error fetching data for new appointment page:', clinicsError || patientsError);
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-destructive">Error Loading Page</h1>
            <p>Could not fetch necessary data. Please try again later.</p>
        </div>
    );
  }

  const patients = (patientsData || [])
    .map(p => ({
        id: p.user_id,
        full_name: `${p.first_name || ''} ${p.last_name || ''}`.trim(),
    }))
    .filter((p): p is { id: string; full_name: string } => p.id !== null);
  
  const clinics = clinicsData || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Appointment</h1>
        <p className="text-muted-foreground">
          Fill out the form below to schedule a new appointment for a patient.
        </p>
      </div>
      <NewAppointmentForm clinics={clinics} patients={patients} />
    </div>
  );
} 