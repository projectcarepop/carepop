'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { Clinic, Service, ServiceCategory, GroupedService } from '@/lib/types/booking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Loader2, Info, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@clerk/nextjs';
import { getClinics, getServices, getSpecializations } from '@/lib/apiClient';
import { Combobox } from '@/components/ui/combobox';

const ClinicServiceSelectionStep: React.FC = () => {
  const { state, dispatch } = useBookingContext();
  const {
    selectedClinic,
    selectedService,
    clinics,
    servicesForClinic,
    isLoading,
    errors
  } = state;

  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [specializations, setSpecializations] = useState<ServiceCategory[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);

  const { getToken, isSignedIn } = useAuth();

  const fetchClinics = async () => {
    if (!isSignedIn) {
      dispatch({ type: 'SET_CLINICS_ERROR', payload: 'You must be logged in to view clinics.' });
      return;
    }
    dispatch({ type: 'SET_CLINICS_LOADING', payload: true });
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not found.");
      const data = await getClinics(token);
      dispatch({ type: 'SET_CLINICS_SUCCESS', payload: data });
    } catch (error) {
      console.error("Error fetching clinics:", error);
      dispatch({ type: 'SET_CLINICS_ERROR', payload: `We couldn't load the list of clinics. Please check your connection and try again.` });
    }
  };

  const fetchSpecializations = async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not found.");
      const data = await getSpecializations(token);
      setSpecializations(data);
    } catch (error) {
      console.error("Error fetching specializations:", error);
    }
  };

  const fetchServicesForClinic = async (clinicId: string) => {
    if (!isSignedIn) {
      dispatch({ type: 'SET_SERVICES_FOR_CLINIC_ERROR', payload: 'You must be logged in to view services.' });
      return;
    }
    dispatch({ type: 'SET_SERVICES_FOR_CLINIC_LOADING', payload: true });
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not found.");
      
      const services = await getServices(token, clinicId, selectedSpecialization || undefined);

      const groupedServices = services.reduce((acc, service) => {
        const category = service.specialization?.name || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(service);
        return acc;
      }, {} as Record<string, Service[]>);

      const groupedAndFormatted: GroupedService[] = Object.keys(groupedServices).map(category => ({
        category: category,
        services: groupedServices[category],
      }));

      dispatch({ type: 'SET_SERVICES_FOR_CLINIC_SUCCESS', payload: groupedAndFormatted });
    } catch (error) {
      console.error("Error fetching services for clinic:", error);
      dispatch({ type: 'SET_SERVICES_FOR_CLINIC_ERROR', payload: `We couldn't load services for this clinic. Please try selecting the clinic again.` });
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchClinics();
      fetchSpecializations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  useEffect(() => {
    if (selectedClinic?.id && isSignedIn) {
      fetchServicesForClinic(selectedClinic.id);
    } else {
      dispatch({ type: 'SET_SERVICES_FOR_CLINIC_SUCCESS', payload: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClinic, isSignedIn, selectedSpecialization]);

  const filteredServices = useMemo(() => {
    if (!serviceSearchTerm) {
      return servicesForClinic;
    }

    const lowercasedFilter = serviceSearchTerm.toLowerCase();
    return servicesForClinic
      .map(categoryGroup => ({
        ...categoryGroup,
        services: categoryGroup.services.filter(
          service =>
            service.name.toLowerCase().includes(lowercasedFilter) ||
            (service.description && service.description.toLowerCase().includes(lowercasedFilter))
        ),
      }))
      .filter(categoryGroup => categoryGroup.services.length > 0);
  }, [servicesForClinic, serviceSearchTerm]);

  const handleClinicSelect = (clinic: Clinic) => {
    dispatch({ type: 'SELECT_CLINIC', payload: clinic });
  };

  const handleServiceSelect = (service: Service) => {
    dispatch({ type: 'SELECT_SERVICE', payload: service });
  };

  const goToNextStep = () => {
    if (selectedClinic && selectedService) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: 2 });
    }
  };

  const specializationOptions = [
    { value: 'all', label: 'All Specializations' },
    ...specializations.map(s => ({ value: s.id, label: s.name }))
  ];

  return (
    <Card className="w-full max-w-5xl shadow-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Step 1: Select Clinic & Service</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">Choose your preferred clinic and the service you need.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="flex items-center text-md font-medium text-gray-700 mb-2">
            Select a Clinic
          </h3>
          {isLoading.clinics && <div className="flex items-center space-x-2 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> <span>Loading clinics...</span></div>}
          
          {errors.clinics && (
            <Alert variant="destructive" className="mt-2">
              <Info className="h-5 w-5 mr-2"/>
              <AlertTitle>Error Loading Clinics</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                {errors.clinics}
                <Button onClick={() => fetchClinics()} variant="secondary" size="sm" className="ml-4">
                  {isLoading.clinics && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!isLoading.clinics && !errors.clinics && clinics.length === 0 && (
            <Alert variant="default" className="mt-2">
              <Info className="h-5 w-5 mr-2"/>
              <AlertTitle>No Clinics Available</AlertTitle>
              <AlertDescription>There are currently no clinics available to select.</AlertDescription>
            </Alert>
          )}

          {!isLoading.clinics && !errors.clinics && clinics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {clinics.map((clinic) => (
                <div 
                  key={clinic.id} 
                  onClick={() => handleClinicSelect(clinic)}
                  className={cn(
                    "cursor-pointer transition-all duration-150 ease-in-out hover:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-lg border",
                    selectedClinic?.id === clinic.id ? "ring-2 ring-primary shadow-lg border-primary" : "border-border hover:border-gray-300 dark:hover:border-gray-700"
                  )}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleClinicSelect(clinic) : null}
                >
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-primary truncate">{clinic.name}</h4>
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                      <MapPin size={12} className="mr-1.5 flex-shrink-0" />
                      <span className="truncate">{clinic.address || 'Address not available'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedClinic && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <h3 className="flex items-center text-md font-medium text-gray-700">
                Select a Service at {selectedClinic.name}
                </h3>
                <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
                    <Combobox
                        options={specializationOptions}
                        value={selectedSpecialization || 'all'}
                        onChange={(value) => setSelectedSpecialization(value === 'all' ? null : value)}
                        placeholder="Filter by specialization..."
                        searchPlaceholder="Search specializations..."
                    />
                    <div className="relative w-full md:w-auto">
                        <Input
                            placeholder="Search for a service..."
                            value={serviceSearchTerm}
                            onChange={(e) => setServiceSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    </div>
                </div>
            </div>
            
            {isLoading.servicesForClinic && <div className="flex items-center space-x-2 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> <span>Loading services...</span></div>}

            {errors.servicesForClinic && (
               <Alert variant="destructive" className="mt-2">
                <Info className="h-5 w-5 mr-2"/>
                <AlertTitle>Error Loading Services</AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  {errors.servicesForClinic}
                  <Button onClick={() => fetchServicesForClinic(selectedClinic.id)} variant="secondary" size="sm" className="ml-4">
                    {isLoading.servicesForClinic && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Try Again
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {!isLoading.servicesForClinic && !errors.servicesForClinic && (
                <div className="border rounded-md">
                    <ScrollArea className="h-96">
                        {filteredServices.length > 0 ? (
                            filteredServices.map((group) => (
                                <div key={group.category} className="p-2">
                                    <h4 className="text-sm font-semibold mb-2 text-primary px-2">{group.category}</h4>
                                    <div className="flex flex-col space-y-1">
                                    {group.services.map((service) => (
                                        <div
                                            key={service.id}
                                            onClick={() => handleServiceSelect(service)}
                                            className={cn(
                                                "cursor-pointer p-3 rounded-md transition-colors",
                                                selectedService?.id === service.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                            )}
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleServiceSelect(service) : null}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-semibold">{service.name}</div>
                                                    <div className="text-xs text-muted-foreground">{service.description}</div>
                                                </div>
                                                <div className="text-sm font-bold text-primary">
                                                    {service.price ? `₱${Number(service.price).toFixed(2)}` : 'Price not set'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-muted-foreground">
                                No services found for the selected criteria.
                            </div>
                        )}
                    </ScrollArea>
                </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end pt-6 border-t">
        <Button onClick={goToNextStep} disabled={!selectedClinic || !selectedService || isLoading.servicesForClinic}>
          Next: Select Date & Time
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClinicServiceSelectionStep;