'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { Clinic, Service, ServiceCategory as BookingServiceCategory } from '@/lib/types/booking'; // Aliased ServiceCategory to avoid conflict if any local one exists by chance
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Info, MapPin, Clock, Phone, Search, ListFilter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from "@/components/ui/scroll-area";

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_e) {
    return [hoursString.length > 100 ? hoursString.substring(0, 97) + '...' : hoursString];
  }
};

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
  const [allServiceCategories, setAllServiceCategories] = useState<string[]>([]);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<string[]>([]);

  // Effect to extract and set all categories once servicesForClinic loads
  useEffect(() => {
    if (servicesForClinic && servicesForClinic.length > 0) {
      const categories = Array.from(new Set(servicesForClinic.map(sg => sg.category)));
      setAllServiceCategories(categories);
      setSelectedServiceCategories(categories); // Initially, select all categories
    }
  }, [servicesForClinic]);

  useEffect(() => {
    dispatch({ type: 'SET_CLINICS_LOADING', payload: true });
    // API Call: GET /api/directory/clinics (Backend Integration Guide - Section 1.1)
    // Fetches all clinics since search term is removed
    fetch(`/api/v1/directory/clinics`) 
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.success) {
          dispatch({ type: 'SET_CLINICS_SUCCESS', payload: data.data as Clinic[] });
        } else {
          dispatch({ type: 'SET_CLINICS_ERROR', payload: data.message || 'Failed to fetch clinics.' });
        }
      })
      .catch((error) => {
        console.error("Error fetching clinics:", error);
        dispatch({ type: 'SET_CLINICS_ERROR', payload: error.message || 'An error occurred while fetching clinics.' });
      });
  }, [dispatch]);

  useEffect(() => {
    if (selectedClinic?.id) {
      dispatch({ type: 'SET_SERVICES_FOR_CLINIC_LOADING', payload: true });
      // API Call: GET /api/clinics/:clinicId/services (Backend Integration Guide - Section 1.2)
      // TODO: Replace with a proper API client or service call if available
      fetch(`/api/v1/clinics/${selectedClinic.id}/services`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (data.success) {
            dispatch({ type: 'SET_SERVICES_FOR_CLINIC_SUCCESS', payload: data.data as BookingServiceCategory[] });
          } else {
            dispatch({ type: 'SET_SERVICES_FOR_CLINIC_ERROR', payload: data.message || 'Failed to fetch services for the clinic.' });
          }
        })
        .catch((error) => {
          console.error("Error fetching services for clinic:", error);
          dispatch({ type: 'SET_SERVICES_FOR_CLINIC_ERROR', payload: error.message ||'An error occurred while fetching services.' });
        });
    } else {
      // Clear services if no clinic is selected
      dispatch({ type: 'SET_SERVICES_FOR_CLINIC_SUCCESS', payload: [] });
    }
  }, [selectedClinic, dispatch]);

  const handleCategoryChange = (category: string) => {
    setSelectedServiceCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const filteredServices = useMemo(() => {
    let servicesToFilter = servicesForClinic;

    // Filter by selected categories
    if (selectedServiceCategories.length > 0) {
      servicesToFilter = servicesForClinic.filter(categoryGroup => 
        selectedServiceCategories.includes(categoryGroup.category)
      );
    } else {
      // If no categories are selected, behave as if all are (effectively no category filter, only search)
      // Or, if you prefer to show nothing if no category is selected, you can return [] here.
      // For now, let's assume it means no category filter is active.
      servicesToFilter = servicesForClinic;
    }

    // Filter by search term
    if (!serviceSearchTerm) {
      // If no search term, but categories might be filtered
      return servicesToFilter
        .map(categoryGroup => ({
          ...categoryGroup,
          services: categoryGroup.services, // Services within already category-filtered groups
        }))
        .filter(categoryGroup => categoryGroup.services.length > 0);
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
  }, [servicesForClinic, serviceSearchTerm, selectedServiceCategories]);

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
            {/* <Building className="mr-2 h-5 w-5 text-primary" /> */}
            Select a Clinic
          </h3>
          {isLoading.clinics && <div className="flex items-center space-x-2 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> <span>Loading clinics...</span></div>}
          {errors.clinics && <Alert variant="destructive" className="mt-2"><AlertTitle className="flex items-center"><Info className="h-5 w-5 mr-2"/>Error Loading Clinics</AlertTitle><AlertDescription>{errors.clinics}</AlertDescription></Alert>}
          
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
                  <CardContent className="pl-md pr-md">
                    {/* Optional: Clinic Image/Logo - similar to airline logo */}
                    {/* {clinic.imageUrl && ( <div className="relative w-full h-24 rounded-t-md overflow-hidden mb-1.5"><Image src={clinic.imageUrl} alt={clinic.name} layout="fill" objectFit="cover" /></div> )} */}
                    
                    <h4 className="text-md font-medium text-primary truncate">{clinic.name}</h4>
                    
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div className="flex items-start">
                        <MapPin className="h-3 w-3 mr-1 mt-0.5 shrink-0" /> 
                        <span className="text-xs">{clinic.address}</span>
                      </div>
                      {clinic.contactPhone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1 shrink-0" /> 
                          <span className="text-xs">{clinic.contactPhone}</span>
                        </div>
                      )}
                      {clinic.operatingHours && formatOperatingHours(clinic.operatingHours).map((line, index) => (
                        <div key={index} className="flex items-center">
                          {index === 0 && <Clock className="h-3 w-3 mr-1 shrink-0" />}
                          {index !== 0 && <div className="w-3 mr-1 shrink-0" /> /* Spacer for subsequent lines */}
                          <span className="text-xs">{line}</span>
                        </div>
                      ))}
                    </div>
                    {/* Example of right-aligned info like price/duration from flight UI */}
                    {/* <div className="flex justify-end items-center pt-2">
                       <span className="text-sm font-semibold text-primary">Details...</span> 
                    </div> */} 
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {selectedClinic && (
          <div className="space-y-2 pt-4 border-t mt-6">
            <h3 className="flex items-center text-md font-medium text-gray-700 mb-3">
              {/* <Stethoscope className="mr-2 h-5 w-5 text-primary"/> */}
              Services at {selectedClinic.name}
            </h3>

            <div className="flex flex-col md:flex-row gap-6 md:gap-8 mt-1">
              {/* Left Column: Category Filters */}
              {allServiceCategories.length > 0 && (
                <div className="w-full md:w-1/4 space-y-3 pb-4">
                  
                  {/* Service Search Input - REMOVED FROM HERE */}

                  {/* Categories Title */}
                  <h4 className="flex items-center text-sm text-gray-600 pt-2">
                    <ListFilter className="mr-2 h-4 w-4" />
                    Categories
                  </h4>
                  {/* Added a new div for the border below Categories title */}
                  <div className="border-b mt-2 mb-3"></div>

                  {/* Category Checkboxes ScrollArea - MOVED BELOW CATEGORIES TITLE */}
                  <ScrollArea className="max-h-48 md:max-h-64 pr-1">
                    <div className="space-y-2 pr-2">
                    {allServiceCategories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`category-${category}`}
                          checked={selectedServiceCategories.includes(category)}
                          onCheckedChange={() => handleCategoryChange(category)}
                        />
                        <Label htmlFor={`category-${category}`} className="text-xs font-normal cursor-pointer hover:text-primary">
                          {category}
                        </Label>
                      </div>
                    ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Right Column: Search and Service List */}
              <div className="w-full md:w-3/4 flex flex-col">
                {/* Service Search Input - MOVED HERE */}
                <div className="relative mb-3"> 
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search all services..."
                    value={serviceSearchTerm}
                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
                
                {isLoading.servicesForClinic && <div className="flex items-center space-x-1.5 text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> <span>Loading services...</span></div>}
                {!isLoading.servicesForClinic && filteredServices.length === 0 && !errors.servicesForClinic && (
                  <Alert variant="default" className="mt-1.5 text-xs">
                    <Info className="h-4 w-4 mr-1.5"/>
                    <AlertTitle>
                      {serviceSearchTerm || selectedServiceCategories.length < allServiceCategories.length ? 'No Matching Services' : 'No Services Found'}
                    </AlertTitle>
                    <AlertDescription>
                      {serviceSearchTerm || selectedServiceCategories.length < allServiceCategories.length
                        ? `No services match your current filter and search. Try adjusting them.` 
                        : 'No services found for this clinic, or services are still loading.'}
                    </AlertDescription>
                  </Alert>
                )}
                {errors.servicesForClinic && <Alert variant="destructive" className="mt-1.5 text-xs"><AlertTitle className="flex items-center text-sm"><Info className="h-4 w-4 mr-1.5"/>Error Loading Services</AlertTitle><AlertDescription>{errors.servicesForClinic}</AlertDescription></Alert>}
                
                {!isLoading.servicesForClinic && filteredServices.length > 0 && (
                  <ScrollArea className="flex-1 min-h-0 max-h-72 w-full border rounded-md">
                    <div className="p-3 space-y-2">
                      {filteredServices.map(categoryGroup => (
                        // If you want to show category titles above their respective services *again* after filtering:
                        // <div key={categoryGroup.category + "-group"} className="mb-2">
                        //   {selectedServiceCategories.length === 0 || selectedServiceCategories.length === allServiceCategories.length ? (
                        //      <h4 className="text-xs font-semibold text-muted-foreground mb-1 pt-1">{categoryGroup.category}</h4>
                        //    ) : null}
                        categoryGroup.services.map((service) => (
                          <Card 
                            key={service.id} 
                            onClick={() => handleServiceSelect(service)}
                            className={cn(
                              "cursor-pointer transition-all duration-150 ease-in-out hover:shadow-md focus-within:ring-1 focus-within:ring-primary focus-within:ring-offset-1",
                              selectedService?.id === service.id ? "ring-1 ring-primary shadow-md border-primary" : "border-border"
                            )}
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleServiceSelect(service) : null}
                          >
                            <CardContent className="py-1"> {/* Further reduced vertical padding */}
                              <h5 className="text-sm font-medium text-gray-800">{service.name}</h5>
                              {service.description && <p className="text-xs text-muted-foreground">{service.description}</p>} {/* Removed mt-1 */}
                              {/* Removed service duration display */}
                            </CardContent>
                          </Card>
                        ))
                        //</div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-4 mt-4">
        <Button 
            onClick={goToNextStep} 
            disabled={!selectedClinic || !selectedService || isLoading.clinics || isLoading.servicesForClinic}
            size="default"
        >
          Next: Select Provider
          {/* <ArrowRight className="ml-1.5 h-3.5 w-3.5" /> */}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClinicServiceSelectionStep; 