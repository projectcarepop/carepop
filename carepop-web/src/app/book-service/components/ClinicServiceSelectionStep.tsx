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
  
  // Refactored data fetching logic into dedicated functions
  const fetchClinics = async () => {
    dispatch({ type: 'SET_CLINICS_LOADING', payload: true });
    try {
      const res = await fetch(`/api/v1/directory/clinics`);
      if (!res.ok) {
        // More descriptive error based on status
        const errorText = res.status === 404 ? 'The clinics directory could not be found.' : `An unexpected error occurred (Code: ${res.status}).`;
        throw new Error(errorText);
      }
      const data = await res.json();
      if (data.success) {
        dispatch({ type: 'SET_CLINICS_SUCCESS', payload: data.data as Clinic[] });
      } else {
        throw new Error(data.message || 'Failed to parse clinic data.');
      }
    } catch (error) {
      console.error("Error fetching clinics:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      dispatch({ type: 'SET_CLINICS_ERROR', payload: 'We couldn’t load the list of clinics. Please check your connection and try again.' });
    }
  };

  const fetchServicesForClinic = async (clinicId: string) => {
    dispatch({ type: 'SET_SERVICES_FOR_CLINIC_LOADING', payload: true });
    try {
      const res = await fetch(`/api/v1/clinics/${clinicId}/services`);
      if (!res.ok) {
        const errorText = res.status === 404 ? `Services for this clinic could not be found.` : `An unexpected error occurred (Code: ${res.status}).`;
        throw new Error(errorText);
      }
      const data = await res.json();
      if (data.success) {
        dispatch({ type: 'SET_SERVICES_FOR_CLINIC_SUCCESS', payload: data.data as BookingServiceCategory[] });
      } else {
        throw new Error(data.message || 'Failed to parse services data.');
      }
    } catch (error) {
      console.error("Error fetching services for clinic:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      dispatch({ type: 'SET_SERVICES_FOR_CLINIC_ERROR', payload: 'We couldn’t load services for this clinic. Please try selecting the clinic again.' });
    }
  };


  // Effect to extract and set all categories once servicesForClinic loads
  useEffect(() => {
    if (servicesForClinic && servicesForClinic.length > 0) {
      const categories = Array.from(new Set(servicesForClinic.map(sg => sg.category)));
      setAllServiceCategories(categories);
      setSelectedServiceCategories(categories); // Initially, select all categories
    }
  }, [servicesForClinic]);

  useEffect(() => {
    fetchClinics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedClinic?.id) {
      fetchServicesForClinic(selectedClinic.id);
    } else {
      // Clear services if no clinic is selected
      dispatch({ type: 'SET_SERVICES_FOR_CLINIC_SUCCESS', payload: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClinic]);

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
          
          {errors.clinics && (
            <Alert variant="destructive" className="mt-2">
              <Info className="h-5 w-5 mr-2"/>
              <AlertTitle>Error Loading Clinics</AlertTitle>
              <AlertDescription>
                {errors.clinics}
                <Button onClick={() => fetchClinics()} variant="secondary" size="sm" className="ml-4">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" hidden={!isLoading.clinics} />
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
          <div className="space-y-4">
            <h3 className="flex items-center text-md font-medium text-gray-700 mb-2">
              Select a Service at {selectedClinic.name}
            </h3>
            
            {isLoading.servicesForClinic && <div className="flex items-center space-x-2 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> <span>Loading services...</span></div>}

            {errors.servicesForClinic && (
               <Alert variant="destructive" className="mt-2">
                <Info className="h-5 w-5 mr-2"/>
                <AlertTitle>Error Loading Services</AlertTitle>
                <AlertDescription>
                  {errors.servicesForClinic}
                   <Button onClick={() => fetchServicesForClinic(selectedClinic.id)} variant="secondary" size="sm" className="ml-4">
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" hidden={!isLoading.servicesForClinic} />
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
            )}
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