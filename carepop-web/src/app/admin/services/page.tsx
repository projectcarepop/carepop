import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ServiceList } from './components/ServiceList';
import { z } from 'zod';

const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
});

interface ServicesPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default function ServicesPage({ searchParams }: ServicesPageProps) {
  const parsedSearchParams = searchParamsSchema.parse(searchParams);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Services</h1>
        <Button asChild>
          <Link href="/admin/services/new">Add New Service</Link>
        </Button>
      </div>
      <ServiceList {...parsedSearchParams} />
    </div>
  );
} 