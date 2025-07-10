'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

import { getAdminClinics, upsertClinic, getAdminServices } from '@/services/api';
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
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDebounce } from 'use-debounce';

interface ClinicsClientProps {
  initialClinics: any; // Allow any for initial data to handle paginated response
}

export default function ClinicsClient({ initialClinics }: ClinicsClientProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  // State for controlling the Create/Edit modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedClinic, setSelectedClinic] = React.useState<Clinic | undefined>(undefined);

  // State for controlling the Deactivate confirmation dialog
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = React.useState(false);
  const [clinicToDeactivate, setClinicToDeactivate] = React.useState<Clinic | undefined>(undefined);
  
  // Server-side filtering and pagination state
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [pagination, setPagination] = React.useState({
    pageIndex: 0, // tanstack-table uses 0-based index
    pageSize: 10,
  });
  const [debouncedFilter] = useDebounce(globalFilter, 500);

  const queryKey = ['adminClinics', pagination, debouncedFilter];

  const {
    data,
    isLoading: isLoadingClinics,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: () => getAdminClinics(session!.access_token, { 
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      q: debouncedFilter,
     }),
    initialData: initialClinics,
    enabled: !!session,
  });

  const { data: servicesData, isLoading: isLoadingServices } = useQuery({
    queryKey: ['adminServicesForClinicForm'],
    queryFn: () => getAdminServices(session!.access_token),
    enabled: !!session,
  });

  const allServices = servicesData || [];

  const clinics = data?.data || [];
  const pageCount = data?.pagination?.totalPages ?? 0;
  const isLoading = isLoadingClinics || isLoadingServices;

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

  const deactivateMutation = useMutation({
    mutationFn: (clinicId: string) => {
      // We now call upsertClinic with isActive: false to deactivate.
      return upsertClinic({ id: clinicId, isActive: false }, session!.access_token, clinicId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminClinics'] });
      toast({
        title: 'Clinic Deactivated',
        description: 'The clinic has been successfully deactivated and is no longer visible to patients.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error Deactivating Clinic',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsDeactivateDialogOpen(false);
      setClinicToDeactivate(undefined);
    }
  });

  const handleCreateNew = () => {
    setSelectedClinic(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = async (clinic: Clinic) => {
    // Fetch the full clinic data including serviceIds
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/clinics/${clinic.id}`, { 
        headers: {
          'Authorization': `Bearer ${session!.access_token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch clinic details');
      }
      
      const fullClinicData = await response.json();
      setSelectedClinic(fullClinicData);
      setIsModalOpen(true);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load clinic details',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivate = (clinic: Clinic) => {
    setClinicToDeactivate(clinic);
    setIsDeactivateDialogOpen(true);
  }

  // Pass the edit and deactivate handlers to the columns definition
  const dynamicColumns = React.useMemo(() => columns({ onEdit: handleEdit, onDelete: handleDeactivate }), [handleEdit, handleDeactivate]);

  if (isError) return <div>Failed to load clinics: {error?.message}</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <CardHeader className="p-0">
        <CardTitle>Manage Clinics</CardTitle>
        <CardDescription>
          This page allows you to create, view, edit, and deactivate all clinic locations on the platform.
        </CardDescription>
      </CardHeader>
      
      <DataTable
        columns={dynamicColumns}
        data={clinics || []}
        pageCount={pageCount}
        pagination={pagination}
        setPagination={setPagination as React.Dispatch<React.SetStateAction<any>>}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        isLoading={isLoading}
        toolbarActions={
          <Button onClick={handleCreateNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Clinic
          </Button>
        }
      />
      
      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-4xl">
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
            allServices={allServices}
            onSubmit={(values) => {
              const { latitude, longitude, serviceIds, ...rest } = values;
              const payload = {
                ...rest,
                location: {
                  lat: latitude,
                  lon: longitude,
                },
                id: selectedClinic?.id,
                serviceIds, // Pass this along to the upsertClinic function
              };
              upsertMutation.mutate(payload as any);
            }}
            isPending={upsertMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to deactivate this clinic?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will make the 
              <span className="font-semibold"> {clinicToDeactivate?.name} </span> 
              clinic inactive and hidden from users. It will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => clinicToDeactivate && deactivateMutation.mutate(clinicToDeactivate.id)}
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending ? 'Deactivating...' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 