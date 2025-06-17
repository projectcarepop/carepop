import { ServiceForm } from '../../components/ServiceForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

async function getService(id: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching service ${id}:`, error);
        notFound();
    }
    return data;
}

async function getCategories() {
    const supabase = await createSupabaseServerClient();
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

export default async function EditServicePage({ params }: { params: { id: string }}) {
  const [service, categories] = await Promise.all([
      getService(params.id),
      getCategories()
  ]);

  const initialData = {
      id: service.id,
      name: service.name,
      description: service.description || undefined,
      cost: service.cost || 0,
      typical_duration_minutes: service.typical_duration_minutes || 30,
      category_id: service.category_id || null,
      is_active: service.is_active,
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Service</CardTitle>
          <CardDescription>
            Update the details for &quot;{service.name}&quot; below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceForm initialData={initialData} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}