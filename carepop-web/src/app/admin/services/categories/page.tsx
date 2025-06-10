import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ServiceCategoryList from './components/ServiceCategoryList';

export default function ServiceCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Service Categories</h1>
        <Button asChild>
          <Link href="/admin/services/categories/new">Add New Category</Link>
        </Button>
      </div>
      <ServiceCategoryList />
    </div>
  );
} 