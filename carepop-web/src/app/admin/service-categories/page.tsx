import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ServiceCategoryTable } from './components/ServiceCategoryTable';

export default function AdminServiceCategoriesPage() {
  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Service Categories</h1>
        <Button asChild>
          <Link href="/admin/service-categories/new">Create New Category</Link>
        </Button>
      </div>
      <p className="text-muted-foreground">
        Group your services into categories for better organization and filtering.
      </p>
      
      <ServiceCategoryTable />
    </div>
  );
} 