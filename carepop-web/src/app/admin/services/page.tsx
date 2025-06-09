import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ServiceTable } from './components/ServiceTable';

export default function AdminServicesPage() {
  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Services</h1>
        <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/service-categories">Manage Categories</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/services/new">Create New Service</Link>
            </Button>
        </div>
      </div>
      <p className="text-muted-foreground">
        Here you can create, view, update, and delete all clinical services offered.
      </p>
      
      <ServiceTable />
    </div>
  );
} 