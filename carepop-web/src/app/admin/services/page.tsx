import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ServiceList } from './components/ServiceList';

interface ServicesPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default function ServicesPage({ searchParams }: ServicesPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Services</h1>
        <Button asChild>
          <Link href="/admin/services/new">Add New Service</Link>
        </Button>
      </div>
      <ServiceList 
        page={Number(searchParams?.page ?? 1)}
        per_page={Number(searchParams?.per_page ?? 10)}
        sort={searchParams?.sort as string | undefined}
        search={searchParams?.search as string | undefined}
      />
    </div>
  );
} 