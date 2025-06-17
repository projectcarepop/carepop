import { ServiceForm } from '../components/ServiceForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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

export default async function NewServicePage() {
  const categories = await getCategories();

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
          <ServiceForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
} 