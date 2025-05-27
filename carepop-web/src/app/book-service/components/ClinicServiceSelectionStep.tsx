'use client';

import React, { useEffect } from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { Clinic, Service, ServiceCategory as BookingServiceCategory } from '@/lib/types/booking'; // Aliased ServiceCategory to avoid conflict if any local one exists by chance
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from 'lucide-react';

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Step 1: Select Clinic & Service</CardTitle>
        <CardDescription>Choose your preferred clinic and the service you need.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="clinic-select" className="block text-sm font-medium text-gray-700">Select a Clinic</label>
          {isLoading.clinics && <div className="flex items-center space-x-2"><Loader2 className="h-5 w-5 animate-spin" /> <span>Loading clinics...</span></div>}
          <Select 
            onValueChange={handleClinicSelect} 
            value={selectedClinic?.id || ''}
            disabled={isLoading.clinics || clinics.length === 0}
          >
            <SelectTrigger id="clinic-select" className={isLoading.clinics || clinics.length === 0 ? "cursor-not-allowed" : ""}>
              <SelectValue placeholder={isLoading.clinics ? "Loading..." : (clinics.length === 0 && !isLoading.clinics ? "No clinics available" : "Select a clinic")} />
            </SelectTrigger>
            <SelectContent>
              {clinics.map((clinic) => (
                <SelectItem key={clinic.id} value={clinic.id}>
                  {clinic.name} <span className="text-xs text-gray-500 ml-2">({clinic.address})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.clinics && <Alert variant="destructive" className="mt-2"><AlertTitle>Error Loading Clinics</AlertTitle><AlertDescription>{errors.clinics}</AlertDescription></Alert>}
        </div>

        {selectedClinic && (
          <div className="space-y-2 pt-4 border-t mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Services at {selectedClinic.name}</h3>
            {isLoading.servicesForClinic && <div className="flex items-center space-x-2"><Loader2 className="h-5 w-5 animate-spin" /> <span>Loading services...</span></div>}
            {!isLoading.servicesForClinic && servicesForClinic.length === 0 && !errors.servicesForClinic && (
              <p className="text-sm text-gray-500">No services found for this clinic, or services are still loading.</p>
            )}
            {errors.servicesForClinic && <Alert variant="destructive" className="mt-2"><AlertTitle>Error Loading Services</AlertTitle><AlertDescription>{errors.servicesForClinic}</AlertDescription></Alert>}
            
            {!isLoading.servicesForClinic && servicesForClinic.length > 0 && (
                <Accordion type="single" collapsible className="w-full" defaultValue={servicesForClinic[0]?.category}>
                {servicesForClinic.map((categoryGroup) => (
                    <AccordionItem value={categoryGroup.category} key={categoryGroup.category}>
                    <AccordionTrigger className="hover:no-underline">
                        {categoryGroup.category} ({categoryGroup.services.length})
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 pt-2">
                        {categoryGroup.services.map((service) => (
                            <Button 
                            key={service.id} 
                            variant={selectedService?.id === service.id ? "default" : "outline"} 
                            className="w-full justify-start text-left h-auto py-3 px-4 rounded-md border transition-colors duration-150 ease-in-out focus:ring-2 focus:ring-primary"
                            onClick={() => handleServiceSelect(service)}
                            >
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm">{service.name}</span>
                                <span className="text-xs text-muted-foreground mt-0.5">{service.description}</span>
                                <span className="text-xs text-muted-foreground mt-1">Duration: {service.typicalDurationMinutes} mins</span>
                            </div>
                            </Button>
                        ))}
                        </div>
                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-6 mt-6">
        <Button 
            onClick={goToNextStep} 
            disabled={!selectedClinic || !selectedService || isLoading.clinics || isLoading.servicesForClinic}
            size="lg"
        >
          Next: Select Provider
          {/* <ArrowRight className="ml-2 h-4 w-4" /> */}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClinicServiceSelectionStep; 