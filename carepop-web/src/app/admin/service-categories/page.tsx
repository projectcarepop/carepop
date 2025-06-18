import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { ServiceCategoryTable } from './components/ServiceCategoryTable';

interface ServiceCategoriesPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default async function ServiceCategoriesPage({ searchParams }: ServiceCategoriesPageProps) {
  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Service Category Management</h1>
        <Button asChild>
          <Link href="/admin/service-categories/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground">
        Here you can view, create, edit, and manage all service categories in the system.
      </p>
      
      <ServiceCategoryTable 
        page={Number(searchParams?.page ?? 1)}
        per_page={Number(searchParams?.per_page ?? 10)}
        sort={searchParams?.sort as string | undefined}
        search={searchParams?.search as string | undefined}
      />
    </div>
  );
}