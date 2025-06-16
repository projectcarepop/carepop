'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { Clinic, Service, ServiceCategory as BookingServiceCategory } from '@/lib/types/booking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Loader2, Info, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/lib/contexts/AuthContext';

const ClinicServiceSelectionStep: React.FC = () => {
  const { state, dispatch } = useBookingContext();
  const { session } = useAuth();
  const { 
    selectedClinic, 
    selectedService,
    clinics,
    servicesForClinic,
    isLoading,
    errors 
  } = state;

  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [allServiceCategories, setAllServiceCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  const fetchClinics = async () => {
    if (!session) {
      dispatch({ type: 'SET_CLINICS_ERROR', payload: 'You must be logged in to view clinics.' });
      return;
    }
    dispatch({ type: 'SET_CLINICS_LOADING', payload: true });
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/public/clinics`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (!res.ok) {
        const errorText = res.status === 401 
          ? 'You are not authorized to view this page.'
          : res.status === 404 
          ? 'The clinics directory could not be found.' 
          : `An unexpected error occurred (Code: ${res.status}).`;
        throw new Error(errorText);
      }
      const result = await res.json();
      const data: Clinic[] = result.data;
      dispatch({ type: 'SET_CLINICS_SUCCESS', payload: data });
    } catch (error) {
      console.error("Error fetching clinics:", error);
      dispatch({ type: 'SET_CLINICS_ERROR', payload: `We couldn't load the list of clinics. Please check your connection and try again.` });
    }
  };

  const fetchServicesForClinic = async (clinicId: string) => {
    if (!session) {
      dispatch({ type: 'SET_SERVICES_FOR_CLINIC_ERROR', payload: 'You must be logged in to view services.' });
      return;
    }
    dispatch({ type: 'SET_SERVICES_FOR_CLINIC_LOADING', payload: true });
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/public/clinics/${clinicId}/services`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (!res.ok) {
        const errorText = res.status === 404 ? `Services for this clinic could not be found.` : `An unexpected error occurred (Code: ${res.status}).`;
        throw new Error(errorText);
      }
      const result = await res.json();
      const services: Service[] = result.data;

      const groupedServices = services.reduce((acc, service) => {
        const category = service.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(service);
        return acc;
      }, {} as Record<string, Service[]>);

      const groupedAndFormatted: BookingServiceCategory[] = Object.keys(groupedServices).map(category => ({
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
    if (servicesForClinic && servicesForClinic.length > 0) {
      const categories = ['All Services', ...Array.from(new Set(servicesForClinic.map(sg => sg.category)))];
      setAllServiceCategories(categories);
      setActiveCategory('All Services'); // Default to showing all
    } else {
      setAllServiceCategories([]);
      setActiveCategory(null);
    }
  }, [servicesForClinic]);

  useEffect(() => {
    if (session) {
      fetchClinics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (selectedClinic?.id && session) {
      fetchServicesForClinic(selectedClinic.id);
    } else {
      dispatch({ type: 'SET_SERVICES_FOR_CLINIC_SUCCESS', payload: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClinic, session]);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
  };

  const filteredServices = useMemo(() => {
    let servicesToFilter = servicesForClinic;

    // Filter by active category
    if (activeCategory && activeCategory !== 'All Services') {
        servicesToFilter = servicesForClinic.filter(categoryGroup => 
            categoryGroup.category === activeCategory
        );
    }

    // Filter by search term
    if (!serviceSearchTerm) {
      return servicesToFilter;
    }

    const lowercasedFilter = serviceSearchTerm.toLowerCase();
    return servicesToFilter
      .map(categoryGroup => ({
        ...categoryGroup,
        services: categoryGroup.services.filter(
          service =>
            service.name.toLowerCase().includes(lowercasedFilter) ||
            (service.description && service.description.toLowerCase().includes(lowercasedFilter))
        ),
      }))
      .filter(categoryGroup => categoryGroup.services.length > 0);
  }, [servicesForClinic, serviceSearchTerm, activeCategory]);

  const handleClinicSelect = (clinicId: string) => {
    const clinic = clinics.find(c => c.id === clinicId);
    dispatch({ type: 'SELECT_CLINIC', payload: clinic || null });
  };

  const handleServiceSelect = (service: Service) => {
    dispatch({ type: 'SELECT_SERVICE', payload: service });
  };

  const goToNextStep = () => {
    if (selectedClinic && selectedService) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: 2 });
    }
  };

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
                  onClick={() => handleClinicSelect(clinic.id)}
                  className={cn(
                    "cursor-pointer transition-all duration-150 ease-in-out hover:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-lg border",
                    selectedClinic?.id === clinic.id ? "ring-2 ring-primary shadow-lg border-primary" : "border-border hover:border-gray-300 dark:hover:border-gray-700"
                  )}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleClinicSelect(clinic.id) : null}
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
            <div className="flex justify-between items-center">
                <h3 className="flex items-center text-md font-medium text-gray-700">
                Select a Service at {selectedClinic.name}
                </h3>
                <div className="relative w-full max-w-xs">
                    <Input
                        placeholder="Search for a service..."
                        value={serviceSearchTerm}
                        onChange={(e) => setServiceSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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

            {!isLoading.servicesForClinic && !errors.servicesForClinic && servicesForClinic.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Left Panel: Service Categories */}
                <div className="md:col-span-1">
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Categories</h4>
                  <ScrollArea className="h-72 pr-4">
                    <div className="flex flex-col space-y-1">
                      {allServiceCategories.map(category => (
                        <Button
                          key={category}
                          variant={activeCategory === category ? 'secondary' : 'ghost'}
                          className="w-full justify-start"
                          onClick={() => handleCategoryClick(category)}
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Right Panel: Services List */}
                <div className="md:col-span-3">
                   <ScrollArea className="h-72 pr-4">
                      {filteredServices.length > 0 ? (
                        filteredServices.map((group) => (
                          <div key={group.category} className="mb-4">
                            {activeCategory === 'All Services' && (
                               <h4 className="text-sm font-semibold mb-2 text-primary">{group.category}</h4>
                            )}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                              {group.services.map(service => (
                                <div 
                                  key={service.id}
                                  onClick={() => handleServiceSelect(service)}
                                  className={cn(
                                    "p-3 cursor-pointer transition-all duration-150 ease-in-out hover:shadow-md focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 rounded-lg border",
                                    selectedService?.id === service.id ? "ring-2 ring-primary shadow-lg border-primary" : "border-border hover:border-gray-300 dark:hover:border-gray-700"
                                  )}
                                  tabIndex={0}
                                  onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleServiceSelect(service) : null}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h5 className="text-sm font-semibold text-gray-800">{service.name}</h5>
                                      {service.description && <p className="text-xs text-muted-foreground mt-1">{service.description}</p>}
                                    </div>
                                    <p className="text-sm font-medium text-primary ml-4 whitespace-nowrap">
                                      ₱{Number(service.cost).toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-10">
                           <Search className="mx-auto h-10 w-10 mb-4 text-gray-300" />
                          <h4 className="font-semibold">No Services Found</h4>
                          <p className="text-sm">Try adjusting your search or selecting a different category.</p>
                        </div>
                      )}
                  </ScrollArea>
                </div>
              </div>
            )}

            {!isLoading.servicesForClinic && !errors.servicesForClinic && servicesForClinic.length === 0 && selectedClinic && (
              <Alert variant="default" className="mt-2">
                <Info className="h-5 w-5 mr-2"/>
                <AlertTitle>No Services Available</AlertTitle>
                <AlertDescription>This clinic does not currently have any services listed.</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={goToNextStep} 
          disabled={!selectedClinic || !selectedService || isLoading.clinics || isLoading.servicesForClinic}
          className="ml-auto"
        >
          {isLoading.servicesForClinic && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Next
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClinicServiceSelectionStep; 