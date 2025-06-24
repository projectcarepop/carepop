import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { ServicesClient } from '@/components/admin-dashboard/services/ServicesClient';
import { type Service, type ServiceCategory } from '@/types/app';
import { apiClient } from '@/lib/apiClient';

async function fetchData(accessToken: string) {
    try {
        const [servicesRes, categoriesRes] = await Promise.all([
            apiClient.api.admin.services.$get({ headers: { 'Authorization': `Bearer ${accessToken}` } }),
            apiClient.api.admin["service-categories"].$get({ headers: { 'Authorization': `Bearer ${accessToken}` } })
        ]);

        const servicesData = servicesRes.ok ? (await servicesRes.json()).data : [];
        const categoriesData = categoriesRes.ok ? (await categoriesRes.json()).data : [];
        
        return { services: servicesData as Service[], categories: categoriesData as ServiceCategory[] };
    } catch (error) {
        console.error('An unexpected error occurred while fetching services data:', error);
        return { services: [], categories: [] };
    }
}

export default async function ManageServicesPage() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return null;
    
    const { services, categories } = await fetchData(session.access_token);
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Manage Services</h1>
                <p className="text-muted-foreground">
                    Create, view, and manage service categories and individual services.
                </p>
            </div>
            <ServicesClient initialServices={services} initialCategories={categories} />
        </div>
    );
} 