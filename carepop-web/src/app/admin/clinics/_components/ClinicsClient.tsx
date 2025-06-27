'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

import { getAdminClinics, upsertClinic, deleteClinic } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { type Clinic } from '@/lib/types';
import { columns } from './columns';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClinicForm } from './ClinicForm';
import { useAuth } from '@/lib/contexts/auth-context';

interface ClinicsClientProps {
  initialClinics: Clinic[];
}

export default function ClinicsClient({ initialClinics }: ClinicsClientProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  // State for controlling the Create/Edit modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedClinic, setSelectedClinic] = React.useState<Clinic | undefined>(undefined);

  // State for controlling the Delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [clinicToDelete, setClinicToDelete] = React.useState<Clinic | undefined>(undefined);

  const {
    data: clinics,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['adminClinics'],
    queryFn: () => getAdminClinics(session!.access_token),
    initialData: initialClinics,
    enabled: !!session,
  });

  const upsertMutation = useMutation({
    mutationFn: (clinicData: Partial<Clinic>) => {
      return upsertClinic(clinicData, session!.access_token, clinicData.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
      toast({
        title: 'Success!',
        description: 'Clinic has been saved.',
      });
      setIsModalOpen(false);
      setSelectedClinic(undefined);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to save clinic: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (clinicId: string) => {
      return deleteClinic(clinicId, session!.access_token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
      toast({
        title: 'Clinic Deleted',
        description: 'The clinic has been successfully deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error Deleting Clinic',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsDeleteDialogOpen(false);
      setClinicToDelete(undefined);
    }
  });

  const handleCreateNew = () => {
    setSelectedClinic(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setIsModalOpen(true);
  };

  const handleDelete = (clinic: Clinic) => {
    setClinicToDelete(clinic);
    setIsDeleteDialogOpen(true);
  }

  // Pass the edit and delete handlers to the columns definition
  const dynamicColumns = React.useMemo(() => columns({ onEdit: handleEdit, onDelete: handleDelete }), []);

  if (isError) return <div>Failed to load clinics: {error?.message}</div>;

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold">Manage Clinics</h1>
        <Button onClick={handleCreateNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Clinic
        </Button>
      </div>

      {/* Create/Edit Modal */}
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the 
              <span className="font-semibold"> {clinicToDelete?.name} </span> 
              clinic.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => clinicToDelete && deleteMutation.mutate(clinicToDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
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