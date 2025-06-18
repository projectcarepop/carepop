import { ServiceForm } from '../components/ServiceForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { createService } from '@/lib/actions/service.admin.actions';
import { redirect } from 'next/navigation';

async function getCategories() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
        .from('service_categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name', { ascending: true });

    if (error) {
        console.error("Failed to fetch service categories:", error);
        return [];
    }
    return data;
}

export default async function NewServicePage() {
  const categories = await getCategories();

  async function handleSave(values: any) {
    'use server';
    const newService = await createService(values);
    if (newService?.id) {
        redirect(`/admin/services/${newService.id}/edit`);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Service</CardTitle>
          <CardDescription>
            Fill out the form below to add a new clinical service to the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceForm categories={categories} onSave={handleSave} />
        </CardContent>
      </Card>
    </div>
  );
} 