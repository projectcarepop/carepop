import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ServiceList from './components/ServiceList';

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Services</h1>
        <Button asChild>
          <Link href="/admin/services/new">Add New Service</Link>
        </Button>
      </div>
      <ServiceList />
    </div>
  );
} 