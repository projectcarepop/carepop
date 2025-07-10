'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, MapPin, Phone } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/contexts/auth-context';

import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

import { assignServicesToClinic, updateClinicDoctorAssignments } from '@/services/api';
import { serviceAssignmentsColumns } from './service-assignments-columns';
import { doctorAssignmentsColumns } from './doctor-assignments-columns';
import { AddServicesModal } from './AddServicesModal';
import { ManageDoctorAssignmentsModal } from './ManageDoctorAssignmentsModal';
import { ManageServiceAssignmentsModal } from './ManageServiceAssignmentsModal';

// Updated type to handle both possible backend response formats
type ManagementContext = {
  // Format 1: New nested structure
  clinic: {
    id: string;
    name: string;
    street: string | null;
    cityMunicipalityCode: string | null;
    provinceCode: string | null;
    zipCode: string | null;
    phoneNumber: string | null;
    services?: { service: { id: string; name: string; description?: string } }[];
    doctors?: { doctor: { id: string; fullName: string } }[];
    doctorClinicServices?: { doctorId: string; serviceId: string }[];
  };
  allServices?: { id: string; name: string; description?: string; serviceCategory?: { name: string } }[];
  allDoctors?: { id: string; fullName: string; specialization?: string }[];
  
  // Format 2: Original flat structure  
  assignedServices?: { id: string; name: string; description?: string }[];
  assignedDoctors?: { id: string; fullName: string }[];
  doctorServiceAssignments?: { doctorId: string; serviceId: string }[];
};

interface ClinicManagementClientProps {
  initialContext: ManagementContext;
  clinicId: string;
}

export function ClinicManagementClient({ initialContext, clinicId }: ClinicManagementClientProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  
  // State for modals
  const [isAddServicesModalOpen, setIsAddServicesModalOpen] = useState(false);
  const [isDoctorAssignmentsModalOpen, setIsDoctorAssignmentsModalOpen] = useState(false);
  const [isServiceAssignmentsModalOpen, setIsServiceAssignmentsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  
  // State for search
  const [servicesSearch, setServicesSearch] = useState('');
  const [doctorsSearch, setDoctorsSearch] = useState('');

  // Debug logging
  console.log('Initial Context:', initialContext);
  console.log('Clinic Services:', initialContext?.clinic?.services);
  console.log('Clinic Doctors:', initialContext?.clinic?.doctors);
  console.log('Doctor Clinic Services:', initialContext?.clinic?.doctorClinicServices);

  // Transform data for tables
  const servicesData = useMemo(() => {
    console.log('Processing services data...');
    
    // Try Format 1: New nested structure
    let clinicServices = initialContext?.clinic?.services;
    let doctorClinicServices = initialContext?.clinic?.doctorClinicServices;
    let allDoctors = initialContext?.allDoctors;
    
    // Fallback to Format 2: Original flat structure
    if (!clinicServices && initialContext?.assignedServices) {
      console.log('Using Format 2 (flat structure)');
      clinicServices = initialContext.assignedServices.map(service => ({ service }));
      doctorClinicServices = initialContext?.doctorServiceAssignments || [];
      allDoctors = initialContext?.assignedDoctors || [];
    }
    
    if (!clinicServices || !Array.isArray(clinicServices)) {
      console.log('No services data found in either format');
      return [];
    }
    
    const result = clinicServices
      .map(cs => {
        const rawService = cs?.service || cs; // Handle both nested and flat service objects
        if (!rawService || !('id' in rawService)) return null;
        
        // Type assertion after checking for 'id' property
        const service = rawService as { id: string; name: string; description?: string };
        
        const assignments = doctorClinicServices || [];
        const doctors = allDoctors || [];
        
        const assignedDoctors = assignments
          .filter(dcs => dcs?.serviceId === service.id)
          .map(dcs => {
            const doctor = doctors.find(d => d?.id === dcs?.doctorId);
            return doctor ? { id: doctor.id, fullName: doctor.fullName } : null;
          })
          .filter((doctor): doctor is { id: string; fullName: string } => doctor !== null);
        
        return {
          id: service.id,
          name: service.name,
          description: service.description || undefined,
          assignedDoctors: assignedDoctors.length > 0 ? assignedDoctors : undefined
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
    
    console.log('Transformed services data:', result);
    return result;
  }, [initialContext]);

  const doctorsData = useMemo(() => {
    console.log('Processing doctors data...');
    
    // Try Format 1: New nested structure
    let clinicDoctors = initialContext?.clinic?.doctors;
    let clinicServices = initialContext?.clinic?.services;
    let doctorClinicServices = initialContext?.clinic?.doctorClinicServices;
    
    // Fallback to Format 2: Original flat structure
    if (!clinicDoctors && initialContext?.assignedDoctors) {
      console.log('Using Format 2 (flat structure) for doctors');
      clinicDoctors = initialContext.assignedDoctors.map(doctor => ({ doctor }));
      clinicServices = (initialContext?.assignedServices || []).map(service => ({ service }));
      doctorClinicServices = initialContext?.doctorServiceAssignments || [];
    }
    
    if (!clinicDoctors || !Array.isArray(clinicDoctors)) {
      console.log('No doctors data found in either format');
      return [];
    }
    
    const result = clinicDoctors
      .map(cd => {
        const doctor = cd?.doctor || cd; // Handle both nested and flat doctor objects
        if (!doctor) return null;
        
        const assignments = doctorClinicServices || [];
        const services = clinicServices || [];
        
        const assignedServices = assignments
          .filter(dcs => dcs?.doctorId === doctor.id)
          .map(dcs => {
            const service = services.find(cs => {
              const svc = cs?.service || cs;
              return svc?.id === dcs?.serviceId;
            });
            const svc = service?.service || service;
            return (svc && 'id' in svc) ? { id: svc.id, name: svc.name } : null;
          })
          .filter((service): service is { id: string; name: string } => service !== null);
        
        return {
          id: doctor.id,
          fullName: doctor.fullName,
          specialization: undefined,
          assignedServices: assignedServices.length > 0 ? assignedServices : undefined
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
    
    console.log('Transformed doctors data:', result);
    return result;
  }, [initialContext]);

  // Filtered data for search
  const filteredServicesData = useMemo(() => {
    if (!servicesSearch) return servicesData;
    return servicesData.filter(service => 
      service.name.toLowerCase().includes(servicesSearch.toLowerCase())
    );
  }, [servicesData, servicesSearch]);

  const filteredDoctorsData = useMemo(() => {
    if (!doctorsSearch) return doctorsData;
    return doctorsData.filter(doctor => 
      doctor.fullName.toLowerCase().includes(doctorsSearch.toLowerCase())
    );
  }, [doctorsData, doctorsSearch]);

  // Mutation for adding services
  const addServicesMutation = useMutation({
    mutationFn: async (serviceIds: string[]) => {
      // Handle both data formats
      const clinicServices = initialContext?.clinic?.services || [];
      const assignedServices = initialContext?.assignedServices || [];
      
      let currentServiceIds: string[];
      if (clinicServices.length > 0) {
        // Format 1: nested structure
        currentServiceIds = clinicServices.map(cs => cs?.service?.id).filter(Boolean) as string[];
      } else {
        // Format 2: flat structure
        currentServiceIds = assignedServices.map(s => s?.id).filter(Boolean) as string[];
      }
      
      const allServiceIds = [...new Set([...currentServiceIds, ...serviceIds])];
      return assignServicesToClinic(clinicId, allServiceIds, session!.access_token);
    },
    onMutate: async (serviceIds) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['clinic-management', clinicId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['clinic-management', clinicId]);

      // Optimistically update the cache
      queryClient.setQueryData(['clinic-management', clinicId], (old: any) => {
        if (!old) return old;
        
        const newData = { ...old };
        
        // Add the new services to clinic.services
        if (newData.clinic && newData.allServices) {
          const currentServices = newData.clinic.services || [];
          const currentServiceIds = currentServices.map((cs: any) => cs.service?.id || cs.id);
          
          // Find the new services to add
          const servicesToAdd = newData.allServices.filter((service: any) => 
            serviceIds.includes(service.id) && !currentServiceIds.includes(service.id)
          );
          
          // Add them to clinic.services
          const newServices = servicesToAdd.map((service: any) => ({
            service: service
          }));
          
          newData.clinic.services = [...currentServices, ...newServices];
        }
        
        return newData;
      });

      // Close modal immediately
      setIsAddServicesModalOpen(false);

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Services added successfully' });
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ['clinic-management', clinicId] });
    },
    onError: (error: Error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(['clinic-management', clinicId], context.previousData);
      }
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      
      // Reopen modal on error
      setIsAddServicesModalOpen(true);
    },
  });

  // Mutation for removing service
  const removeServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      // Handle both data formats
      const clinicServices = initialContext?.clinic?.services || [];
      const assignedServices = initialContext?.assignedServices || [];
      
      let remainingServiceIds: string[];
      if (clinicServices.length > 0) {
        // Format 1: nested structure
        remainingServiceIds = clinicServices
          .filter(cs => cs?.service?.id !== serviceId)
          .map(cs => cs?.service?.id)
          .filter(Boolean) as string[];
      } else {
        // Format 2: flat structure
        remainingServiceIds = assignedServices
          .filter(s => s?.id !== serviceId)
          .map(s => s?.id)
          .filter(Boolean) as string[];
      }
      
      return assignServicesToClinic(clinicId, remainingServiceIds, session!.access_token);
    },
    onMutate: async (serviceId) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['clinic-management', clinicId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['clinic-management', clinicId]);

      // Optimistically update the cache
      queryClient.setQueryData(['clinic-management', clinicId], (old: any) => {
        if (!old) return old;
        
        const newData = { ...old };
        
        // Remove the service from clinic.services
        if (newData.clinic?.services) {
          newData.clinic.services = newData.clinic.services.filter(
            (cs: any) => cs.service?.id !== serviceId
          );
        }
        
        // Also remove any doctor assignments for this service
        if (newData.clinic?.doctorClinicServices) {
          newData.clinic.doctorClinicServices = newData.clinic.doctorClinicServices.filter(
            (dcs: any) => dcs.serviceId !== serviceId
          );
        }
        
        return newData;
      });

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Service removed successfully' });
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ['clinic-management', clinicId] });
    },
    onError: (error: Error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(['clinic-management', clinicId], context.previousData);
      }
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Mutation for updating doctor assignments
  const updateDoctorAssignmentsMutation = useMutation({
    mutationFn: async ({ serviceId, doctorIds }: { serviceId: string, doctorIds: string[] }) => {
      // Only update assignments for this specific service
      // The backend will only delete/update assignments for the services we specify
      return updateClinicDoctorAssignments({
        clinicId,
        assignments: [{ serviceId, doctorIds }],
        token: session!.access_token
      });
    },
    onMutate: async ({ serviceId, doctorIds }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['clinic-management', clinicId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['clinic-management', clinicId]);

      // Optimistically update the cache
      queryClient.setQueryData(['clinic-management', clinicId], (old: any) => {
        if (!old) return old;
        
        const newData = { ...old };
        
        // Update doctorClinicServices with new assignments
        if (newData.clinic?.doctorClinicServices) {
          // Remove existing assignments for this service
          newData.clinic.doctorClinicServices = newData.clinic.doctorClinicServices.filter(
            (dcs: any) => dcs.serviceId !== serviceId
          );
          
          // Add new assignments
          const newAssignments = doctorIds.map(doctorId => ({
            doctorId,
            serviceId,
            clinicId
          }));
          
          newData.clinic.doctorClinicServices = [
            ...newData.clinic.doctorClinicServices,
            ...newAssignments
          ];
        }
        
        return newData;
      });

      // Close modal immediately
      setIsDoctorAssignmentsModalOpen(false);
      setSelectedService(null);

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Doctor assignments updated successfully' });
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ['clinic-management', clinicId] });
    },
    onError: (error: Error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(['clinic-management', clinicId], context.previousData);
      }
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      
      // Reopen modal on error
      setIsDoctorAssignmentsModalOpen(true);
    },
  });

  // Action handlers - using the exact types from the column definitions
  const handleManageDoctors = (service: { id: string; name: string; description?: string; assignedDoctors?: { id: string; fullName: string }[] }) => {
    setSelectedService(service);
    setIsDoctorAssignmentsModalOpen(true);
  };

  const handleRemoveService = (service: { id: string; name: string; description?: string; assignedDoctors?: { id: string; fullName: string }[] }) => {
    if (confirm(`Are you sure you want to remove "${service.name}" from this clinic?`)) {
      removeServiceMutation.mutate(service.id);
    }
  };

  const handleManageServices = (doctor: { id: string; fullName: string; specialization?: string; assignedServices?: { id: string; name: string }[] }) => {
    setSelectedDoctor(doctor);
    setIsServiceAssignmentsModalOpen(true);
  };

  const handleRemoveDoctor = (doctor: { id: string; fullName: string; specialization?: string; assignedServices?: { id: string; name: string }[] }) => {
    if (confirm(`Are you sure you want to remove "${doctor.fullName}" from this clinic?`)) {
      toast({ title: 'Info', description: 'Doctor removal functionality will be implemented later' });
    }
  };

  // Mutation for updating service assignments to doctors
  const updateServiceAssignmentsMutation = useMutation({
    mutationFn: async ({ doctorId, serviceIds }: { doctorId: string, serviceIds: string[] }) => {
      // We need to be smart about preserving existing assignments for other doctors
      // Get current assignments for all services this doctor should be assigned to
      const currentAssignments = initialContext?.clinic?.doctorClinicServices || [];
      
      // Create assignments array that preserves existing doctors and adds/removes this doctor
      const assignments = serviceIds.map(serviceId => {
        // Get all doctors currently assigned to this service (excluding the current doctor)
        const existingDoctorIds = currentAssignments
          .filter(dcs => dcs.serviceId === serviceId && dcs.doctorId !== doctorId)
          .map(dcs => dcs.doctorId);
        
        // Add the current doctor to the list
        return {
          serviceId,
          doctorIds: [...existingDoctorIds, doctorId]
        };
      });
      
      // Also handle services that this doctor should be REMOVED from
      // Find services this doctor was previously assigned to but is no longer in serviceIds
      const previouslyAssignedServices = currentAssignments
        .filter(dcs => dcs.doctorId === doctorId)
        .map(dcs => dcs.serviceId);
      
      const servicesToRemoveFrom = previouslyAssignedServices.filter(serviceId => 
        !serviceIds.includes(serviceId)
      );
      
      // For services to remove from, preserve other doctors but exclude this doctor
      const removalAssignments = servicesToRemoveFrom.map(serviceId => {
        const existingDoctorIds = currentAssignments
          .filter(dcs => dcs.serviceId === serviceId && dcs.doctorId !== doctorId)
          .map(dcs => dcs.doctorId);
        
        return {
          serviceId,
          doctorIds: existingDoctorIds // Don't include current doctor
        };
      });
      
      // Combine both assignment and removal operations
      const allAssignments = [...assignments, ...removalAssignments];
      
      return updateClinicDoctorAssignments({
        clinicId,
        assignments: allAssignments,
        token: session!.access_token
      });
    },
    onMutate: async ({ doctorId, serviceIds }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['clinic-management', clinicId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['clinic-management', clinicId]);

      // Optimistically update the cache
      queryClient.setQueryData(['clinic-management', clinicId], (old: any) => {
        if (!old) return old;
        
        const newData = { ...old };
        
        // Update doctorClinicServices with new assignments
        if (newData.clinic?.doctorClinicServices) {
          // Remove all existing assignments for this doctor
          newData.clinic.doctorClinicServices = newData.clinic.doctorClinicServices.filter(
            (dcs: any) => dcs.doctorId !== doctorId
          );
          
          // Add new assignments for this doctor
          const newAssignments = serviceIds.map((serviceId: string) => ({
            doctorId,
            serviceId,
            clinicId
          }));
          
          newData.clinic.doctorClinicServices = [
            ...newData.clinic.doctorClinicServices,
            ...newAssignments
          ];
        }
        
        return newData;
      });

      // Close modal immediately
      setIsServiceAssignmentsModalOpen(false);
      setSelectedDoctor(null);

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Service assignments updated successfully' });
      // Invalidate to ensure we have the latest data from server
      queryClient.invalidateQueries({ queryKey: ['clinic-management', clinicId] });
    },
    onError: (error: Error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(['clinic-management', clinicId], context.previousData);
      }
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      
      // Reopen modal on error
      setIsServiceAssignmentsModalOpen(true);
    },
  });

  // Column configurations
  const serviceColumns = serviceAssignmentsColumns({
    onManageDoctors: handleManageDoctors,
    onRemoveService: handleRemoveService
  });

  const doctorColumns = doctorAssignmentsColumns({
    onManageServices: handleManageServices,
    onRemoveDoctor: handleRemoveDoctor
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <Link href="/admin/clinics">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clinics
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{initialContext?.clinic?.name || 'Clinic Management'}</h1>
          <p className="text-muted-foreground">Manage services and doctors</p>
        </div>
      </div>

      <Separator />

      {/* Clinic Details */}
      <Card>
        <CardHeader>
          <CardTitle>Clinic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Address</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {initialContext?.clinic?.street ? (
                  <>
                    {initialContext.clinic.street}
                    {initialContext.clinic.zipCode && `, ${initialContext.clinic.zipCode}`}
                  </>
                ) : (
                  'No address specified'
                )}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Phone</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                {initialContext?.clinic?.phoneNumber || 'No phone number specified'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services ({servicesData.length})</TabsTrigger>
          <TabsTrigger value="doctors">Doctors ({doctorsData.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Clinic Services</CardTitle>
                  <CardDescription>
                    Manage medical services offered at this clinic and assign doctors to provide each service
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsAddServicesModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Services
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Search services..."
                  value={servicesSearch}
                  onChange={(e) => setServicesSearch(e.target.value)}
                  className="max-w-sm"
                />
                {filteredServicesData.length === 0 && !servicesSearch ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No services assigned to this clinic yet.</p>
                    <p className="text-sm">Click &quot;Add Services&quot; to get started.</p>
                  </div>
                ) : (
                  <DataTable
                    columns={serviceColumns}
                    data={filteredServicesData}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Doctors</CardTitle>
              <CardDescription>
                View doctors assigned to this clinic and manage which services each doctor can provide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Search doctors..."
                  value={doctorsSearch}
                  onChange={(e) => setDoctorsSearch(e.target.value)}
                  className="max-w-sm"
                />
                {filteredDoctorsData.length === 0 && !doctorsSearch ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No doctors assigned to this clinic yet.</p>
                    <p className="text-sm">Doctors need to be added through the main doctors page.</p>
                  </div>
                ) : (
                  <DataTable
                    columns={doctorColumns}
                    data={filteredDoctorsData}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddServicesModal
        isOpen={isAddServicesModalOpen}
        onClose={() => setIsAddServicesModalOpen(false)}
        availableServices={initialContext?.allServices || []}
        currentServiceIds={(() => {
          const clinicServices = initialContext?.clinic?.services || [];
          const assignedServices = initialContext?.assignedServices || [];
          
          if (clinicServices.length > 0) {
            return clinicServices.map(cs => cs?.service?.id).filter(Boolean) as string[];
          } else {
            return assignedServices.map(s => s?.id).filter(Boolean) as string[];
          }
        })()}
        onSave={(serviceIds) => addServicesMutation.mutate(serviceIds)}
        isLoading={addServicesMutation.isPending}
      />

      <ManageDoctorAssignmentsModal
        isOpen={isDoctorAssignmentsModalOpen}
        onClose={() => {
          setIsDoctorAssignmentsModalOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
        availableDoctors={initialContext?.allDoctors || []}
        currentAssignments={selectedService ? (() => {
          const doctorClinicServices = initialContext?.clinic?.doctorClinicServices || [];
          const doctorServiceAssignments = initialContext?.doctorServiceAssignments || [];
          
          const assignments = doctorClinicServices.length > 0 ? doctorClinicServices : doctorServiceAssignments;
          
          return assignments
            .filter(dcs => dcs?.serviceId === selectedService.id)
            .map(dcs => dcs?.doctorId)
            .filter(Boolean) as string[];
        })() : []}
        onSave={(serviceId: string, doctorIds: string[]) => updateDoctorAssignmentsMutation.mutate({ 
          serviceId, 
          doctorIds 
        })}
        isLoading={updateDoctorAssignmentsMutation.isPending}
      />

      <ManageServiceAssignmentsModal
        isOpen={isServiceAssignmentsModalOpen}
        onClose={() => {
          setIsServiceAssignmentsModalOpen(false);
          setSelectedDoctor(null);
        }}
        doctor={selectedDoctor}
        availableServices={initialContext?.clinic?.services?.map(cs => cs.service).filter(Boolean) || []}
        currentAssignments={selectedDoctor ? (() => {
          const doctorClinicServices = initialContext?.clinic?.doctorClinicServices || [];
          const doctorServiceAssignments = initialContext?.doctorServiceAssignments || [];
          
          const assignments = doctorClinicServices.length > 0 ? doctorClinicServices : doctorServiceAssignments;
          
          return assignments
            .filter(dcs => dcs?.doctorId === selectedDoctor.id)
            .map(dcs => dcs?.serviceId)
            .filter(Boolean) as string[];
        })() : []}
        onSave={(doctorId: string, serviceIds: string[]) => updateServiceAssignmentsMutation.mutate({ 
          doctorId, 
          serviceIds 
        })}
        isLoading={updateServiceAssignmentsMutation.isPending}
      />
    </div>
  );
} 