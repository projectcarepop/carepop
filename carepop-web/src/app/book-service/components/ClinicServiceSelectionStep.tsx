'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { Clinic, Service, ServiceCategory as BookingServiceCategory } from '@/lib/types/booking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Info, MapPin, Clock, Phone, Search, ListFilter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/lib/contexts/AuthContext';

// Helper function to parse and format operating hours
const formatOperatingHours = (hoursString?: string): string[] => {
  if (!hoursString) return [];
  try {
    const hoursObject = JSON.parse(hoursString);
    const formatted: string[] = [];
    const order = ['Mon-Fri', 'Sat', 'Sun'];
    order.forEach(day => {
      if (hoursObject[day]) {
        formatted.push(`${day}: ${hoursObject[day]}`);
      }
    });
    for (const key in hoursObject) {
      if (key !== 'notes' && !order.includes(key) && hoursObject[key]) {
        formatted.push(`${key}: ${hoursObject[key]}`);
      }
    }
    if (hoursObject.notes) {
      formatted.push(`Notes: ${hoursObject.notes}`);
    }
    return formatted;
  } catch (error) {
    console.error("Error parsing operating hours:", error);
    return [hoursString.length > 100 ? hoursString.substring(0, 97) + '...' : hoursString];
  }
};

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
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<string[]>([]);
  
  const fetchClinics = async () => {
    if (!session) {
      dispatch({ type: 'SET_CLINICS_ERROR', payload: 'You must be logged in to view clinics.' });
      return;
    }
    dispatch({ type: 'SET_CLINICS_LOADING', payload: true });
    try {
      const res = await fetch(`/api/v1/public/clinics`, {
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
      const data: Clinic[] = await res.json();
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
      const res = await fetch(`/api/v1/public/clinics/${clinicId}/services`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (!res.ok) {
        const errorText = res.status === 404 ? `Services for this clinic could not be found.` : `An unexpected error occurred (Code: ${res.status}).`;
        throw new Error(errorText);
      }
      const services: Service[] = await res.json();

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
      const categories = Array.from(new Set(servicesForClinic.map(sg => sg.category)));
      setAllServiceCategories(categories);
      setSelectedServiceCategories(categories);
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

  const handleCategoryChange = (category: string) => {
    setSelectedServiceCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const filteredServices = useMemo(() => {
    let servicesToFilter = servicesForClinic;

    if (selectedServiceCategories.length > 0 && selectedServiceCategories.length < allServiceCategories.length) {
      servicesToFilter = servicesForClinic.filter(categoryGroup => 
        selectedServiceCategories.includes(categoryGroup.category)
      );
    }

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
  }, [servicesForClinic, serviceSearchTerm, selectedServiceCategories, allServiceCategories.length]);

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
            <div className="grid grid-cols-1 gap-2">
              {clinics.map((clinic) => (
                <Card 
                  key={clinic.id} 
                  onClick={() => handleClinicSelect(clinic.id)}
                  className={cn(
                    "cursor-pointer transition-all duration-150 ease-in-out hover:shadow-md focus-within:ring-1 focus-within:ring-primary focus-within:ring-offset-1",
                    selectedClinic?.id === clinic.id ? "ring-1 ring-primary shadow-md border-primary" : "border-border"
                  )}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleClinicSelect(clinic.id) : null}
                >
                  <CardContent className="p-3">
                    <h4 className="text-md font-medium text-primary truncate">{clinic.name}</h4>
                    <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                      <div className="flex items-start">
                        <MapPin className="h-3 w-3 mr-1.5 mt-0.5 shrink-0" /> 
                        <span className="text-xs">{clinic.address}</span>
                      </div>
                      {clinic.contactPhone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1.5 shrink-0" /> 
                          <span className="text-xs">{clinic.contactPhone}</span>
                        </div>
                      )}
                      {clinic.operatingHours && formatOperatingHours(clinic.operatingHours).map((line, index) => (
                        <div key={index} className="flex items-center">
                          {index === 0 && <Clock className="h-3 w-3 mr-1.5 shrink-0" />}
                          {index !== 0 && <div className="w-3 mr-1.5 shrink-0" />}
                          <span className="text-xs">{line}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {selectedClinic && (
          <div className="space-y-4">
            <h3 className="flex items-center text-md font-medium text-gray-700 mb-2">
              Select a Service at {selectedClinic.name}
            </h3>
            
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

            {!isLoading.servicesForClinic && !errors.servicesForClinic && servicesForClinic.length === 0 && (
              <Alert variant="default" className="mt-2">
                <Info className="h-5 w-5 mr-2"/>
                <AlertTitle>No Services Available</AlertTitle>
                <AlertDescription>This clinic currently has no services available for online booking. Please select another clinic.</AlertDescription>
              </Alert>
            )}

            {!isLoading.servicesForClinic && !errors.servicesForClinic && servicesForClinic.length > 0 && (
              <div className="flex flex-col md:flex-row gap-6">
                {allServiceCategories.length > 1 && (
                  <div className="w-full md:w-1/4 space-y-3 pb-4">
                    <h4 className="flex items-center text-sm text-gray-600 pt-2">
                      <ListFilter className="mr-2 h-4 w-4" />
                      Filter by Category
                    </h4>
                    <div className="border-b mt-2 mb-3"></div>
                    <ScrollArea className="max-h-48 md:max-h-64 pr-1">
                      <div className="space-y-2 pr-2">
                      {allServiceCategories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`category-${category}`}
                            checked={selectedServiceCategories.includes(category)}
                            onCheckedChange={() => handleCategoryChange(category)}
                          />
                          <Label htmlFor={`category-${category}`} className="text-sm font-normal cursor-pointer hover:text-primary">
                            {category}
                          </Label>
                        </div>
                      ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                <div className="w-full md:w-3/4 flex flex-col">
                  <div className="relative mb-3"> 
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search services..."
                      value={serviceSearchTerm}
                      onChange={(e) => setServiceSearchTerm(e.target.value)}
                      className="pl-8 w-full"
                    />
                  </div>
                  
                  {filteredServices.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground p-4">
                        <p>No services match your search.</p>
                        {serviceSearchTerm && <Button variant="link" size="sm" onClick={() => setServiceSearchTerm('')}>Clear search</Button>}
                    </div>
                  )}
                  
                  {filteredServices.length > 0 && (
                    <ScrollArea className="flex-1 min-h-0 max-h-72 w-full border rounded-md">
                      <div className="p-2 space-y-2">
                        {filteredServices.map(categoryGroup => (
                           <div key={categoryGroup.category}>
                            {allServiceCategories.length > 1 && <h4 className="text-sm font-semibold tracking-tight text-muted-foreground px-2 py-1.5">{categoryGroup.category}</h4>}
                            <div className="grid grid-cols-1 gap-1.5">
                              {categoryGroup.services.map((service) => (
                                <div 
                                    key={service.id}
                                    onClick={() => handleServiceSelect(service)}
                                    onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleServiceSelect(service) : null}
                                    className={cn(
                                        "flex justify-between items-center p-2 rounded-md cursor-pointer transition-colors hover:bg-muted focus-within:bg-muted focus-within:outline-none",
                                        selectedService?.id === service.id && "bg-muted ring-1 ring-primary"
                                    )}
                                    tabIndex={0}
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{service.name}</p>
                                        {service.description && <p className="text-xs text-muted-foreground">{service.description}</p>}
                                    </div>
                                    <div className="text-sm font-semibold ml-4">
                                        {service.cost ? `₱${Number(service.cost).toFixed(2)}` : 'Free'}
                                    </div>
                                </div>
                              ))}
                            </div>
                           </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
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