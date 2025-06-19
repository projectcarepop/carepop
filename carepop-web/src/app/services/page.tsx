import { getServices } from '@/lib/api/services';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
    const services = await getServices();

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">Book a Service</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service: any) => (
                    <Link href={`/services/${service.id}`} key={service.id}>
                        <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full flex flex-col">
                            <CardHeader>
                                <CardTitle>{service.name}</CardTitle>
                                <CardDescription>{service.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
} 