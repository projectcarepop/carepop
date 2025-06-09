import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { ClinicTable } from './components/ClinicTable'; // This component will be created next

export default async function AdminClinicsPage() {
  // TODO: Add RBAC check here if not handled by layout
  // const session = await auth(); // or your auth method
  // if (session?.user?.role !== 'admin') {
  //   notFound(); // or redirect
  // }

  // TODO: Fetch initial data for the table if doing server-side initial load
  // const initialClinics = await fetchClinicsAPI(); 

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clinic Management</h1>
        <Button asChild>
          <Link href="/admin/clinics/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Clinic
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground">
        Here you can view, create, edit, and manage all clinic locations in the system.
      </p>
      
      <ClinicTable />
      {/* Pass initialData={initialClinics} if fetching server-side */}
    </div>
  );
} 