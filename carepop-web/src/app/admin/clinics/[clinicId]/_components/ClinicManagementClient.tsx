'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/contexts/auth-context';

import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

import { assignServicesToClinic, updateClinicDoctorAssignments } from '@/services/api';
import { serviceAssignmentsColumns } from './service-assignments-columns';
import { doctorAssignmentsColumns } from './doctor-assignments-columns';
import { AddServicesModal } from './AddServicesModal';
import { ManageDoctorAssignmentsModal } from './ManageDoctorAssignmentsModal';

// Updated type to match new backend response
type ManagementContext = {
  clinic: {
    id: string;
    name: string;
    street: string | null;
    cityMunicipalityCode: string | null;
    provinceCode: string | null;
    zipCode: string | null;
    phoneNumber: string | null;
    services: { service: { id: string; name: string; description?: string } }[];
    doctors: { doctor: { id: string; fullName: string } }[];
    doctorClinicServices: { doctorId: string; serviceId: string }[];
  };
  allServices: { id: string; name: string; description?: string; serviceCategory?: { name: string } }[];
  allDoctors: { id: string; fullName: string; specialization?: string }[];
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
  const [selectedService, setSelectedService] = useState<any>(null);
  
  // State for search
  const [servicesSearch, setServicesSearch] = useState('');
  const [doctorsSearch, setDoctorsSearch] = useState('');

  // Transform data for tables
  const servicesData = useMemo(() => {
    if (!initialContext?.clinic?.services || !Array.isArray(initialContext.clinic.services)) return [];
    
    return initialContext.clinic.services
      .map(cs => {
        const service = cs?.service;
        if (!service) return null;
        
        const doctorClinicServices = initialContext.clinic?.doctorClinicServices || [];
        const allDoctors = initialContext?.allDoctors || [];
        
        const assignedDoctors = doctorClinicServices
          .filter(dcs => dcs?.serviceId === service.id)
          .map(dcs => {
            const doctor = allDoctors.find(d => d?.id === dcs?.doctorId);
            return doctor ? { id: doctor.id, fullName: doctor.fullName } : null;
          })
          .filter((doctor): doctor is { id: string; fullName: string } => doctor !== null);
        
        return {
          id: service.id,
          name: service.name,
          description: service.description,
          assignedDoctors: assignedDoctors.length > 0 ? assignedDoctors : undefined
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [initialContext]);

  const doctorsData = useMemo(() => {
    if (!initialContext?.clinic?.doctors || !Array.isArray(initialContext.clinic.doctors)) return [];
    
    return initialContext.clinic.doctors
      .map(cd => {
        const doctor = cd?.doctor;
        if (!doctor) return null;
        
        const doctorClinicServices = initialContext.clinic?.doctorClinicServices || [];
        const clinicServices = initialContext.clinic?.services || [];
        
        const assignedServices = doctorClinicServices
          .filter(dcs => dcs?.doctorId === doctor.id)
          .map(dcs => {
            const service = clinicServices.find(cs => cs?.service?.id === dcs?.serviceId);
            return service ? { id: service.service.id, name: service.service.name } : null;
          })
          .filter((service): service is { id: string; name: string } => service !== null);
        
        return {
          id: doctor.id,
          fullName: doctor.fullName,
          specialization: undefined, // TODO: Add specialization to doctor data
          assignedServices: assignedServices.length > 0 ? assignedServices : undefined
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
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
      const currentServices = initialContext?.clinic?.services || [];
      const currentServiceIds = currentServices.map(cs => cs?.service?.id).filter(Boolean) as string[];
      const allServiceIds = [...new Set([...currentServiceIds, ...serviceIds])];
      return assignServicesToClinic(clinicId, allServiceIds, session!.access_token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-management', clinicId] });
      toast({ title: 'Success', description: 'Services added successfully' });
      setIsAddServicesModalOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Mutation for removing service
  const removeServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const currentServices = initialContext?.clinic?.services || [];
      const remainingServiceIds = currentServices
        .filter(cs => cs?.service?.id !== serviceId)
        .map(cs => cs?.service?.id)
        .filter(Boolean) as string[];
      return assignServicesToClinic(clinicId, remainingServiceIds, session!.access_token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-management', clinicId] });
      toast({ title: 'Success', description: 'Service removed successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Mutation for updating doctor assignments
  const updateDoctorAssignmentsMutation = useMutation({
    mutationFn: async ({ serviceId, doctorIds }: { serviceId: string, doctorIds: string[] }) => {
      return updateClinicDoctorAssignments({
        clinicId,
        assignments: [{ serviceId, doctorIds }],
        token: session!.access_token
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-management', clinicId] });
      toast({ title: 'Success', description: 'Doctor assignments updated successfully' });
      setIsDoctorAssignmentsModalOpen(false);
      setSelectedService(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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

  const handleManageServices = () => {
    // TODO: Implement doctor service management modal
    toast({ title: 'Info', description: 'Doctor service management coming soon' });
  };

  const handleRemoveDoctor = () => {
    // TODO: Implement doctor removal
    toast({ title: 'Info', description: 'Doctor removal coming soon' });
  };

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
      <div className="flex items-center gap-4">
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

      {/* Main Content */}
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Clinic Services</CardTitle>
                <Button onClick={() => setIsAddServicesModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Services
                </Button>
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
                <DataTable
                  columns={serviceColumns}
                  data={filteredServicesData}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doctors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Doctors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Search doctors..."
                  value={doctorsSearch}
                  onChange={(e) => setDoctorsSearch(e.target.value)}
                  className="max-w-sm"
                />
                <DataTable
                  columns={doctorColumns}
                  data={filteredDoctorsData}
                />
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
        currentServiceIds={(initialContext?.clinic?.services || []).map(cs => cs?.service?.id).filter(Boolean) as string[]}
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
        currentAssignments={selectedService ? 
          (initialContext?.clinic?.doctorClinicServices || [])
            .filter(dcs => dcs?.serviceId === selectedService.id)
            .map(dcs => dcs?.doctorId)
            .filter(Boolean) as string[] : []
        }
        onSave={(serviceId: string, doctorIds: string[]) => updateDoctorAssignmentsMutation.mutate({ 
          serviceId, 
          doctorIds 
        })}
        isLoading={updateDoctorAssignmentsMutation.isPending}
      />
    </div>
  );
} 