import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import ServiceCategoryTable from './components/ServiceCategoryTable';

export default async function ServiceCategoriesPage() {
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
      
      <ServiceCategoryTable />
    </div>
  );
} 