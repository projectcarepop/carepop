'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

import { getAdminDoctors, upsertDoctor, deleteDoctor } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { type Doctor } from '@/lib/types';
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
import { DoctorForm } from './DoctorForm';
import { useAuth } from '@/lib/contexts/auth-context';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DoctorsClientProps {
  initialDoctors: Doctor[];
}

export default function DoctorsClient({ initialDoctors }: DoctorsClientProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedDoctor, setSelectedDoctor] = React.useState<Doctor | undefined>(undefined);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [doctorToDelete, setDoctorToDelete] = React.useState<Doctor | undefined>(undefined);

  const {
    data: doctors,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['adminDoctors'],
    queryFn: () => getAdminDoctors(session!.access_token),
    initialData: initialDoctors,
    enabled: !!session,
  });

  const upsertMutation = useMutation({
    mutationFn: (doctorData: Partial<Doctor>) => {
      return upsertDoctor(doctorData as any, session!.access_token, doctorData.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDoctors'] });
      toast({
        title: 'Success!',
        description: 'Doctor has been saved.',
      });
      setIsModalOpen(false);
      setSelectedDoctor(undefined);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to save doctor: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (doctorId: string) => {
      return deleteDoctor(doctorId, session!.access_token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDoctors'] });
      toast({
        title: 'Doctor Deleted',
        description: 'The doctor has been successfully deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error Deleting Doctor',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsDeleteDialogOpen(false);
      setDoctorToDelete(undefined);
    }
  });

  const handleCreateNew = () => {
    setSelectedDoctor(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleDelete = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
    setIsDeleteDialogOpen(true);
  }

  const dynamicColumns = React.useMemo(() => columns({ onEdit: handleEdit, onDelete: handleDelete }), []);

  if (isError) return <div>Failed to load doctors: {error?.message}</div>;

  return (
    <>
      <CardHeader>
          <CardTitle>Manage Doctors</CardTitle>
          <CardDescription>
              This page allows you to create, view, edit, and delete doctor profiles.
          </CardDescription>
      </CardHeader>
      <div className="flex items-center justify-between py-4">
        <div /> 
        <Button onClick={handleCreateNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Doctor
        </Button>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedDoctor ? 'Edit Doctor' : 'Create New Doctor'}
            </DialogTitle>
            <DialogDescription>
              Fill out the details for the doctor below.
            </DialogDescription>
          </DialogHeader>
          <DoctorForm
            initialData={selectedDoctor}
            onSubmit={(values) => {
              const payload = { ...values, id: selectedDoctor?.id };
              upsertMutation.mutate(payload);
            }}
            isPending={upsertMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the doctor:
              <span className="font-semibold"> {doctorToDelete?.fullName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => doctorToDelete && deleteMutation.mutate(doctorToDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <DataTable
        columns={dynamicColumns}
        data={doctors || []}
        filterColumn="fullName"
        filterPlaceholder="Filter by name..."
        isLoading={isLoading}
      />
    </>
  );
} 