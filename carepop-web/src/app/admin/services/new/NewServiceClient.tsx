'use client';

import { useTransition } from 'react';
import { ServiceForm, Specialization } from '../components/ServiceForm';
import { createServiceAction } from '@/lib/actions/service.actions';
import { toast } from 'sonner';

interface NewServiceClientProps {
  specializations: Specialization[];
}

export default function NewServiceClient({ specializations }: NewServiceClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (values: any) => {
    startTransition(async () => {
      const result = await createServiceAction(values);
      if (result?.success === false) {
        toast.error('Error Creating Service', {
          description: result.message || 'An unknown error occurred.',
        });
      } else {
        toast.success('Service Created', {
          description: 'The new service has been added successfully.',
        });
        // The action handles the redirect
      }
    });
  };

  return (
    <ServiceForm
      onSubmit={handleSubmit}
      isPending={isPending}
      specializations={specializations}
    />
  );
} 