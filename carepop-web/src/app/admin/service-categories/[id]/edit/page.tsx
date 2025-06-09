'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { ServiceCategoryForm } from '../../components/ServiceCategoryForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters." }),
  description: z.string().optional(),
});

type ServiceCategoryFormValues = z.infer<typeof formSchema>;

export default function EditServiceCategoryPage() {
  const params = useParams();
  const { id } = params;
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  const [serviceCategory, setServiceCategory] = React.useState<(ServiceCategoryFormValues & {id: string}) | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) {
        setIsLoading(false);
        setError("Service Category ID is missing.");
        return;
    };

    const fetchServiceCategory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) throw new Error("Not authenticated");
        const token = sessionData.session.access_token;

        const response = await fetch(`/api/v1/admin/service-categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch service category data.');
        }

        const result = await response.json();
        const categoryData = result.data;
        
        const mappedData = {
            id: categoryData.id,
            name: categoryData.name,
            description: categoryData.description || undefined,
        };

        const validatedData = formSchema.parse(mappedData);
        setServiceCategory({ ...validatedData, id: categoryData.id });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceCategory();
  }, [id, supabase.auth]);

  if (isLoading) {
    return <div className="container mx-auto py-10">Loading service category details...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-10 text-red-500">Error: {error}</div>;
  }

  if (!serviceCategory) {
    return <div className="container mx-auto py-10">Service category not found.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Service Category</CardTitle>
          <CardDescription>
            Update the details for &quot;{serviceCategory.name}&quot; below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceCategoryForm initialData={serviceCategory} />
        </CardContent>
      </Card>
    </div>
  );
} 