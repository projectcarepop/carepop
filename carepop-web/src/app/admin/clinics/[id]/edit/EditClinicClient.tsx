'use client';

import { useTransition } from 'react';
import { ClinicForm } from '../../components/ClinicForm';
import { toast } from 'sonner';
import { Clinic } from '@/lib/types/clinic.types';
import { updateClinicAction } from '@/lib/actions/clinic.actions';

interface EditClinicClientProps {
  clinic: Clinic;
}

export default function EditClinicClient({ clinic }: EditClinicClientProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (values: any) => {
    startTransition(async () => {
      const result = await updateClinicAction(clinic.id, values);
      if (result?.success === false) {
        toast.error('Error Updating Clinic', {
          description: result.message || 'An unknown error occurred.',
        });
      } else {
        toast.success('Clinic Updated', {
          description: 'The clinic has been updated successfully.',
        });
        // The action handles the redirect
      }
    });
  };

  return (
    <ClinicForm
      initialData={clinic}
      onSubmit={handleSubmit}
      isPending={isPending}
    />
  );
}

 