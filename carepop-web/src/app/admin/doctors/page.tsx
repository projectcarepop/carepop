import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getAdminDoctors } from '@/services/api';
import { DoctorManagementClient } from './_components/doctor-management-client';

export const dynamic = 'force-dynamic';

export default async function DoctorManagementPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const initialDoctors = await getAdminDoctors(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Doctor Management</h1>
        <p className="text-muted-foreground">
          A list of all doctors in the system. You can view details and manage their associations.
        </p>
      </div>
      <DoctorManagementClient initialDoctors={initialDoctors} />
    </div>
  );
} 