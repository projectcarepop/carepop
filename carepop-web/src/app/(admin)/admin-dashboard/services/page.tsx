import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { ServicesClient } from '@/components/admin-dashboard/services/ServicesClient';
import { getAdminServices, getAdminServiceCategories } from '@/services/api';

export default async function ManageServicesPage() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const [servicesData, categoriesData] = await Promise.all([
        getAdminServices(supabase),
        getAdminServiceCategories(supabase)
    ]);
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Manage Services</h1>
                <p className="text-muted-foreground">
                    Create, view, and manage service categories and individual services.
                </p>
            </div>
            <ServicesClient initialServices={servicesData || []} initialCategories={categoriesData || []} />
        </div>
    );
} 