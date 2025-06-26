import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getAdminServices } from '@/services/api';
import { ServiceManagementClient } from './_components/service-management-client';

export const dynamic = 'force-dynamic';

export default async function ServiceManagementPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const initialServices = await getAdminServices(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Service Management</h1>
        <p className="text-muted-foreground">
          A list of all services offered in the system.
        </p>
      </div>
      <ServiceManagementClient initialServices={initialServices} />
    </div>
  );
} 