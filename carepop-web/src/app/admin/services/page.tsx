import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminServices, getAdminServiceCategories } from '@/services/api';
import ServicesClient from './_components/ServicesClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

/**
 * This is the main server component for the Admin Services page.
 * It fetches initial data for both services and service categories
 * and passes it to the client component which will render a tabbed interface.
 */
export default async function AdminServicesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/services');
  }

  try {
    // Fetch both sets of data in parallel for efficiency.
    const [services, categories] = await Promise.all([
      getAdminServices(session.access_token),
      getAdminServiceCategories(session.access_token)
    ]);
    
    return <ServicesClient initialServices={services} initialCategories={categories} />;
  } catch (error: any) {
    console.error(`[AdminServicesPage] Error fetching data:`, error);
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
        redirect('/forbidden');
    }

    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Failed to Load Services Data</AlertTitle>
          <AlertDescription>
            <p>There was an error fetching the services or categories data from the server.</p>
            <p className="mt-2 font-mono text-xs">Error: {error.message}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
}
