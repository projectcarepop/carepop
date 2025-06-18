import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ServiceListClient } from "./components/ServiceListClient";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

type ServicesPageProps = {
  searchParams: {
    page?: string;
    per_page?: string;
    sort?: string;
    search?: string;
  };
};

async function getServices(searchParams: ServicesPageProps['searchParams']) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const page = Number(searchParams?.page ?? 1);
    const perPage = Number(searchParams?.per_page ?? 10);
    const sort = searchParams?.sort ?? 'name.asc';
    const [sortField, sortOrder] = sort.split('.');

    let query = supabase
        .from('services')
        .select(`
            id,
            name,
            description,
            cost,
            is_active,
            category:service_categories ( name )
        `, { count: 'exact' });

    if (searchParams.search) {
        query = query.ilike('name', `%${searchParams.search}%`);
    }

    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    const start = (page - 1) * perPage;
    const end = start + perPage - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) {
        console.error("Error fetching services:", error);
        throw new Error('Failed to fetch services.');
    }

    // The type from Supabase needs to be mapped to the component's expected type
    const mappedServices = data.map(service => ({
        ...service,
        category: Array.isArray(service.category) ? service.category[0] : service.category,
    }));

    return { services: mappedServices, totalRecords: count ?? 0 };
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { services, totalRecords } = await getServices(searchParams);
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold">Services Management</h1>
            <p className="text-muted-foreground">Manage all clinic services and their categories.</p>
        </div>
        <Button asChild>
            <Link href="/admin/services/new">Add New Service</Link>
        </Button>
      </div>
      <ServiceListClient
        data={services}
        totalRecords={totalRecords}
      />
    </div>
  );
}

// This type is a workaround for the mismatch between Supabase's return type and the client component's expectation.
type Service = {
    id: string;
    name: string;
    description: string;
    cost: number;
    category: { name: string } | null;
    is_active: boolean;
} 