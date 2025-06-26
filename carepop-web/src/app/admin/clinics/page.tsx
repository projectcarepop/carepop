import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getAdminClinics } from '@/services/api';
import { ClinicManagementClient } from './_components/clinic-management-client';

export const dynamic = 'force-dynamic';

export default async function ClinicManagementPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const initialClinics = await getAdminClinics(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Clinic Management</h1>
        <p className="text-muted-foreground">
          A list of all clinics in the system. You can view details and manage their status.
        </p>
      </div>
      <ClinicManagementClient initialClinics={initialClinics} />
    </div>
  );
} 