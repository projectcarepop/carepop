import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { ProviderTable } from './components/ProviderTable';

export default async function AdminProvidersPage() {
  // TODO: Add RBAC check here if not handled by layout
  // const session = await auth(); // or your auth method
  // if (session?.user?.role !== 'admin') {
  //   notFound(); // or redirect
  // }

  // TODO: Fetch initial data for the table if doing server-side initial load
  // const initialProviders = await fetchProvidersAPI(); 

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Provider Management</h1>
        <Button asChild>
          <Link href="/admin/providers/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Provider
          </Link>
        </Button>
      </div>
       <p className="text-muted-foreground">
        Manage healthcare providers, their schedules, and assigned services.
      </p>
      
      <ProviderTable />
      {/* Pass initialData={initialProviders} if fetching server-side */}
    </div>
  );
} 