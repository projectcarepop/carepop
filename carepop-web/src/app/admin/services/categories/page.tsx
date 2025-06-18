import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ServiceCategoryList from './components/ServiceCategoryList';

interface ServiceCategoriesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ServiceCategoriesPage({ searchParams }: ServiceCategoriesPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Service Categories</h1>
        <Button asChild>
          <Link href="/admin/services/categories/new">Add New Category</Link>
        </Button>
      </div>
      <ServiceCategoryList search={searchParams.search as string} />
    </div>
  );
}