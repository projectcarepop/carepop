'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { ServiceForm } from '../../components/ServiceForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { z } from 'zod';

// Form schema must match the one in ServiceForm.tsx
const formSchema = z.object({
  name: z.string().min(2, { message: "Service name must be at least 2 characters." }),
  description: z.string().optional(),
  cost: z.coerce.number().min(0).optional(),
  typicalDurationMinutes: z.coerce.number().int().positive().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  isActive: z.boolean(),
});

type ServiceFormValues = z.infer<typeof formSchema>;

export default function EditServicePage() {
  const params = useParams();
  const { id } = params;
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  const [service, setService] = React.useState<(ServiceFormValues & {id: string}) | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) {
        setIsLoading(false);
        setError("Service ID is missing.");
        return;
    };

    const fetchService = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) throw new Error("Not authenticated");
        const token = sessionData.session.access_token;

        const response = await fetch(`/api/v1/admin/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch service data.');
        }

        const result = await response.json();
        const a = result.data;
        
        // Map and validate the data from the API
        const mappedData = {
            id: a.id,
            name: a.name,
            description: a.description || undefined,
            cost: a.cost || 0,
            typicalDurationMinutes: a.typical_duration_minutes || 30,
            categoryId: a.category?.id || null,
            isActive: a.is_active,
        };

        const validatedData = formSchema.parse(mappedData);
        setService({ ...validatedData, id: a.id });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [id, supabase.auth]);

  if (isLoading) {
    return <div className="container mx-auto py-10">Loading service details...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-10 text-red-500">Error: {error}</div>;
  }

  if (!service) {
    return <div className="container mx-auto py-10">Service not found.</div>;
  }

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
          <ServiceForm initialData={service} />
        </CardContent>
      </Card>
    </div>
  );
} 