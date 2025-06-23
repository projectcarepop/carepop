'use client';

import { useTransition } from 'react';
import { ServiceForm } from '@/app/admin/services/components/ServiceForm';
import { updateServiceAction } from '@/lib/actions/service.actions';
import { toast } from 'sonner';
import { Service, ServiceCategory } from '@/lib/types/service.types';

interface EditServiceClientProps {
  service: Service;
  serviceCategories: ServiceCategory[];
}

export default function EditServiceClient({ service, serviceCategories }: EditServiceClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (values: any) => {
    startTransition(async () => {
      const result = await updateServiceAction(service.id, values);
      if (result?.success === false) {
        toast.error('Error Updating Service', {
          description: result.message || 'An unknown error occurred.',
        });
      } else {
        toast.success('Service Updated', {
          description: 'The service has been updated successfully.',
        });
        // The action handles the redirect
      }
    });
  };

  return (
    <ServiceForm
      initialData={service}
      onSubmit={handleSubmit}
      isPending={isPending}
      serviceCategories={serviceCategories}
    />
  );
} 