'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@/lib/contexts/auth-context';
import { toast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

import { getAdminClinics, upsertClinic } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { Clinic } from '@/lib/types';
import { columns } from './columns';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClinicForm } from './ClinicForm';

interface ClinicsClientProps {
  data: Clinic[];
}

export default function ClinicsClient({ data }: ClinicsClientProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedClinic, setSelectedClinic] = React.useState<Clinic | undefined>(
    undefined
  );

  const {
    data: clinics,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['adminClinics'],
    queryFn: () => getAdminClinics(supabase),
    initialData: data,
    staleTime: 1000 * 60, // 1 minute
  });

  const upsertMutation = useMutation({
    mutationFn: (clinicData: Parameters<typeof upsertClinic>[1]) =>
      upsertClinic(supabase, clinicData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
      toast({
        title: 'Success!',
        description: 'Clinic has been saved.',
      });
      setIsModalOpen(false);
      setSelectedClinic(undefined);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save clinic: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleCreateNew = () => {
    setSelectedClinic(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setIsModalOpen(true);
  };

  const dynamicColumns = React.useMemo(() => columns(handleEdit), []);

  if (isError) return <div>Failed to load clinics.</div>;

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedClinic ? 'Edit Clinic' : 'Create New Clinic'}
            </DialogTitle>
            <DialogDescription>
              Fill out the details for the clinic below.
            </DialogDescription>
          </DialogHeader>
          <ClinicForm
            initialData={selectedClinic}
            onSubmit={(values) => {
              const payload = { ...values, id: selectedClinic?.id };
              upsertMutation.mutate(payload);
            }}
            isPending={upsertMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      <div className="flex items-center justify-end py-4">
        <Button onClick={handleCreateNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Clinic
        </Button>
      </div>
      
      <DataTable
        columns={dynamicColumns}
        data={clinics || []}
        filterColumn="name"
        filterPlaceholder="Filter by name..."
        isLoading={isLoading}
      />
    </>
  );
} 