'use client';

import { useTransition } from 'react';
import { ClinicForm } from '../components/ClinicForm';
import { createClinicAction } from '@/lib/actions/clinic.actions';
import { toast } from 'sonner';

export default function NewClinicClient() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (values: any) => {
    startTransition(async () => {
      const result = await createClinicAction(values);
      if (result?.success === false) {
        toast.error('Error Creating Clinic', {
          description: result.message || 'An unknown error occurred.',
        });
      } else {
        toast.success('Clinic Created', {
          description: 'The new clinic has been added successfully.',
        });
        // The action handles the redirect
      }
    });
  };

  return (
    <ClinicForm
      onSubmit={handleSubmit}
      isPending={isPending}
    />
  );
} 