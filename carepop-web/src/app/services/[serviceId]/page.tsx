import { getProvidersForService } from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

// Stub function until the backend endpoint is created
async function getServiceDetails(serviceId: string) {
    // In a real scenario, this would fetch from an endpoint like /api/v1/public/services/${serviceId}
    // For now, we'll just return some placeholder data.
    // The name can be inferred from the provider list later if needed, or passed from previous page.
    return {
        id: serviceId,
        name: 'Service Details', // Placeholder
        description: 'Detailed description of the service, its benefits, and what to expect during the appointment.', // Placeholder
    };
}

export default async function ServiceDetailPage({ params }: { params: { serviceId: string } }) {
    const { serviceId } = params;
    const [serviceDetails, providers] = await Promise.all([
        getServiceDetails(serviceId),
        getProvidersForService(serviceId)
    ]);

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{serviceDetails.name}</h1>
                <p className="text-lg text-muted-foreground mt-2">{serviceDetails.description}</p>
            </div>

            <h2 className="text-2xl font-bold mb-6">Choose a Provider</h2>
            
            {providers && providers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {providers.map((provider: any) => (
                        <Card key={provider.id}>
                            <CardHeader className="flex-row items-center gap-4">
                                <Image
                                    src={provider.avatar_url || '/default-avatar.png'}
                                    alt={`${provider.first_name} ${provider.last_name}`}
                                    width={64}
                                    height={64}
                                    className="rounded-full"
                                />
                                <div>
                                    <CardTitle>{provider.first_name} {provider.last_name}</CardTitle>
                                    <CardDescription>{provider.specialization}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full">
                                    <Link href={`/services/${serviceId}/book/${provider.id}`}>Book Now</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p>No providers are currently available for this service. Please check back later.</p>
            )}
        </div>
    );
} 