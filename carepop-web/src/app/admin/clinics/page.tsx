import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { ClinicTable } from './components/ClinicTable';
import { z } from 'zod';

const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
});

interface AdminClinicsPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function AdminClinicsPage({ searchParams }: AdminClinicsPageProps) {
  const parsedSearchParams = searchParamsSchema.parse(searchParams);

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
      
      <ClinicTable {...parsedSearchParams} />
    </div>
  );
} 