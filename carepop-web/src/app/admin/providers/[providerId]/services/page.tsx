'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

// Define interfaces for the data structures
interface Provider {
    id: string;
    first_name: string;
    last_name: string;
}

interface Service {
    id: string;
    name: string;
    description?: string;
}

export default function ManageProviderServicesPage() {
    const params = useParams();
    const router = useRouter();
    const providerId = params.providerId as string;
    const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

    const [provider, setProvider] = React.useState<Provider | null>(null);
    const [allServices, setAllServices] = React.useState<Service[]>([]);
    const [assignedServiceIds, setAssignedServiceIds] = React.useState<Set<string>>(new Set());
    
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!providerId) return;

        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !sessionData.session) throw new Error("Not authenticated");
                const token = sessionData.session.access_token;

                // Fetch provider details, all services, and currently assigned services in parallel
                const [providerRes, servicesRes, assignedRes] = await Promise.all([
                    fetch(`/api/v1/admin/providers/${providerId}`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/v1/admin/services?limit=1000', { headers: { Authorization: `Bearer ${token}` } }), // Fetch all services
                    fetch(`/api/v1/admin/providers/${providerId}/services`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (!providerRes.ok) throw new Error('Failed to fetch provider details.');
                if (!servicesRes.ok) throw new Error('Failed to fetch services list.');
                if (!assignedRes.ok) throw new Error('Failed to fetch assigned services.');

                const providerData = await providerRes.json();
                const servicesData = await servicesRes.json();
                const assignedData = await assignedRes.json();

                setProvider(providerData.data);
                setAllServices(servicesData.data);
                setAssignedServiceIds(new Set(assignedData.data.map((s: Service) => s.id)));

            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during data fetching.';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [providerId, supabase.auth]);

    const handleToggleService = (serviceId: string) => {
        setAssignedServiceIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(serviceId)) {
                newSet.delete(serviceId);
            } else {
                newSet.add(serviceId);
            }
            return newSet;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !sessionData.session) throw new Error("Not authenticated");
            const token = sessionData.session.access_token;

            const response = await fetch(`/api/v1/admin/providers/${providerId}/services`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ serviceIds: Array.from(assignedServiceIds) })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update services.');
            }

            toast.success("Provider's services updated successfully!");
            router.refresh();

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to save changes.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
        return <div className="container mx-auto py-10">Loading...</div>;
    }

    if (error) {
        return <div className="container mx-auto py-10 text-red-500">Error: {error}</div>;
    }

    if (!provider) {
        return <div className="container mx-auto py-10">Provider not found.</div>;
    }

    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Manage Services for {provider.first_name} {provider.last_name}</CardTitle>
                    <CardDescription>
                        Select the services this provider is authorized to offer.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {allServices.length > 0 ? (
                            allServices.map((service) => (
                                <div key={service.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                                    <Checkbox
                                        id={`service-${service.id}`}
                                        checked={assignedServiceIds.has(service.id)}
                                        onCheckedChange={() => handleToggleService(service.id)}
                                    />
                                    <Label htmlFor={`service-${service.id}`} className="flex-1 cursor-pointer">
                                        <div className="font-medium">{service.name}</div>
                                        {service.description && <p className="text-sm text-muted-foreground">{service.description}</p>}
                                    </Label>
                                </div>
                            ))
                        ) : (
                            <p>No services found. Please create services first.</p>
                        )}
                    </div>
                    {error && <p className="text-sm font-medium text-destructive mt-4">{error}</p>}
                    <div className="flex justify-end mt-6">
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 