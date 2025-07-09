'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

import { getAdminDoctors, upsertDoctor, deleteDoctor, getAdminClinicsList } from '@/services/api';
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
import { Input } from '@/components/ui/input';
import { Clinic } from '@/lib/types/bookings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DoctorsClientProps {
  initialDoctors: (Doctor & { doctorClinics?: { clinicId: string }[] })[];
}

export default function DoctorsClient({ initialDoctors }: DoctorsClientProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedDoctor, setSelectedDoctor] = React.useState<Doctor | undefined>(undefined);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [doctorToDelete, setDoctorToDelete] = React.useState<Doctor | undefined>(undefined);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [selectedClinic, setSelectedClinic] = React.useState('all');

  const { data: clinicsList } = useQuery({
    queryKey: ['adminClinicsList'],
    queryFn: () => getAdminClinicsList(session!.access_token),
    enabled: !!session,
  });

  const {
    data: doctorsResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['adminDoctors', selectedClinic],
    queryFn: () => getAdminDoctors(session!.access_token, selectedClinic),
    initialData: { data: initialDoctors },
    enabled: !!session,
  });

  const doctors = doctorsResponse?.data || [];

  const upsertMutation = useMutation({
    mutationFn: (doctorData: Partial<Doctor & { clinicIds?: string[] }>) => {
      return upsertDoctor(doctorData, session!.access_token, doctorData.id);
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
    <div className="p-4 md:p-8 space-y-6">
      <CardHeader className="p-0">
          <CardTitle>Manage Doctors</CardTitle>
          <CardDescription>
              This page allows you to create, view, edit, and delete doctor profiles.
          </CardDescription>
      </CardHeader>

      <div className="flex items-center justify-between gap-2">
        <Input
            placeholder="Filter by name..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
        />
        <div className="flex items-center gap-2">
            <Select value={selectedClinic} onValueChange={setSelectedClinic}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Filter by clinic..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Clinics</SelectItem>
                    {(clinicsList || []).map((clinic: Clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                            {clinic.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={handleCreateNew}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Doctor
            </Button>
        </div>
      </div>
      
      <DataTable
        columns={dynamicColumns}
        data={doctors}
        filterColumn="fullName"
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        isLoading={isLoading}
      />
      
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
            defaultClinicId={selectedClinic !== 'all' ? selectedClinic : undefined}
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
    </div>
  );
} 