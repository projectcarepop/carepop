import { ServiceForm } from '../../components/ServiceForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createClient } from "@/utils/supabase/server";
import { cookies } from 'next/headers';
import { updateService } from '@/lib/actions/service.admin.actions';
import { notFound } from 'next/navigation';
import { Toaster } from "sonner";

type EditServicePageProps = {
    params: { id: string };
};

async function getService(id: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase.from('services').select('*').eq('id', id).single();
    if (error) {
        console.error("Error fetching service:", error);
        notFound();
    }
    return data;
}

async function getCategories() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase.from('service_categories').select('id, name').order('name');
    
    if (error) {
        console.error("Error fetching categories:", error);
        throw new Error(`Failed to fetch service categories: ${error.message}`);
    }

    return data;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
    const service = await getService(params.id);
    const categories = await getCategories();

    return (
        <div className="p-4 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle>Edit Service</CardTitle>
                <CardDescription>Update the details for the service: {service.name}.</CardDescription>
            </CardHeader>
            <CardContent>
                <ServiceForm
                    initialData={service}
                    categories={categories}
                    onSave={updateService}
                />
            </CardContent>
        </Card>
        <Toaster richColors />
    </div>
    );
}