'use client';

import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Check, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash } from 'lucide-react';

// Raw API response types (matching backend structure before frontend mapping)
interface RawApiClinic {
  id: string;
  name: string;
  full_address: string | null; // As per backend controller
  latitude?: number | null;
  longitude?: number | null;
  contact_phone?: string | null;
  services_offered?: Record<string, unknown> | null; // Changed from any
  operating_hours?: Record<string, unknown> | null; // Changed from any
  fpop_chapter_affiliation?: string | null;
  is_active: boolean;
  // created_at, updated_at, etc.
}

interface RawApiService {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  typical_duration_minutes?: number | null;
  requires_provider_assignment?: boolean | null;
  additional_details?: Record<string, unknown> | null; // Changed from any
  is_active?: boolean; // From nested services object
  created_at?: string;
  updated_at?: string;
  clinic_specific_price?: number | null; // From clinic_services table
}


// Frontend display-focused types
interface ApiClinic {
  id: string;
  name: string;
  full_address: string; // Non-nullable for display, with fallback
}

interface ApiService {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  duration?: string | null;
}

interface ClinicServiceSelectionStepProps {
  selectedClinicId: string | null;
  setSelectedClinicId: Dispatch<SetStateAction<string | null>>;
  selectedServiceId: string | null;
  setSelectedServiceId: Dispatch<SetStateAction<string | null>>;
}

const ClinicServiceSelectionStep: React.FC<ClinicServiceSelectionStepProps> = ({
  selectedClinicId,
  setSelectedClinicId,
  selectedServiceId,
  setSelectedServiceId,
}) => {
  const [clinicsList, setClinicsList] = useState<ApiClinic[]>([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(true);
  const [clinicError, setClinicError] = useState<string | null>(null);

  const [availableServices, setAvailableServices] = useState<ApiService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinics = async () => {
      setIsLoadingClinics(true);
      setClinicError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        if (!baseUrl) {
          throw new Error('Backend API URL is not configured. Please set NEXT_PUBLIC_BACKEND_API_URL.');
        }
        // Ensure no double slashes and add an explicit empty query string just in case
        const clinicsUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/directory/clinics/search?`;
        const response = await fetch(clinicsUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch clinics: ${response.status} ${response.statusText} from ${clinicsUrl}`);
        }
        const data = await response.json(); // Expects { data: RawApiClinic[], ... }
        const fetchedClinics: ApiClinic[] = (data.data || []).map((clinic: RawApiClinic) => ({
          id: clinic.id,
          name: clinic.name,
          full_address: clinic.full_address || 'Address not available',
        }));
        setClinicsList(fetchedClinics);
      } catch (error) {
        console.error("Error fetching clinics:", error);
        setClinicError(error instanceof Error ? error.message : 'An unknown error occurred');
        setClinicsList([]);
      }
      setIsLoadingClinics(false);
    };
    fetchClinics();
  }, []);

  useEffect(() => {
    if (selectedClinicId) {
      const fetchServices = async () => {
        setIsLoadingServices(true);
        setServiceError(null);
        setAvailableServices([]);
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
          if (!baseUrl) {
            throw new Error('Backend API URL is not configured. Please set NEXT_PUBLIC_BACKEND_API_URL.');
          }
          // Ensure no double slashes
          const servicesUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/clinics/${selectedClinicId}/services`;
          const response = await fetch(servicesUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch services: ${response.status} ${response.statusText} from ${servicesUrl}`);
          }
          const rawServicesData = await response.json() as RawApiService[]; // Type assertion here
          
          const fetchedServices: ApiService[] = (rawServicesData || []).map((service: RawApiService) => ({
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.clinic_specific_price,
            duration: service.typical_duration_minutes
              ? `${service.typical_duration_minutes} minutes`
              : 'Duration not specified',
          }));
          setAvailableServices(fetchedServices);
        } catch (error) {
          console.error("Error fetching services:", error);
          setServiceError(error instanceof Error ? error.message : 'An unknown error occurred');
          setAvailableServices([]);
        }
        setIsLoadingServices(false);
      };
      fetchServices();
      setSelectedServiceId(null);
    } else {
      setAvailableServices([]);
      setSelectedServiceId(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClinicId]);

  const handleClinicSelect = (clinicId: string) => {
    setSelectedClinicId(clinicId);
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
  };

  if (isLoadingClinics) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-5 w-3/5 mb-2" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-2/5" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (clinicError) {
    return (
      <Alert variant="destructive">
        <ServerCrash className="h-4 w-4" />
        <AlertTitle>Error Fetching Clinics</AlertTitle>
        <AlertDescription>{clinicError}</AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className={cn('space-y-8')}> 
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-center sm:text-left">
          Choose Your Clinic
        </h3>
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          Start by selecting a clinic for your appointment.
        </p>
      </div>

      {clinicsList.length === 0 && !isLoadingClinics && (
         <Alert>
            <MapPin className="h-4 w-4" />
            <AlertTitle>No Clinics Available</AlertTitle>
            <AlertDescription>
              There are currently no clinics available to book. Please check back later.
            </AlertDescription>
          </Alert>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clinicsList.map((clinic) => (
            <Card
              key={clinic.id}
              className={cn(
                'cursor-pointer p-4 transition-all hover:shadow-lg hover:border-primary/80',
                selectedClinicId === clinic.id && 'border-2 border-primary ring-2 ring-primary/30 bg-primary/5 dark:bg-primary/10'
              )}
              onClick={() => handleClinicSelect(clinic.id)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold text-base">{clinic.name}</h4>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                    <span>{clinic.full_address}</span>
                  </div>
                </div>
                {selectedClinicId === clinic.id && (
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedClinicId && (
        <div className="space-y-4 pt-4 border-t border-border">
            <div className="space-y-2">
                <h3 className="text-xl font-semibold tracking-tight text-center sm:text-left">
                    Available Services at {clinicsList.find(c => c.id === selectedClinicId)?.name || 'Selected Clinic'}
                </h3>
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                    Choose the service you need.
                </p>
            </div>

          {isLoadingServices && (
            <div className="space-y-3 mt-2">
                <div className="flex items-center space-x-3 rounded-md border border-input p-4">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-1/4" />
                </div>
            </div>
          )}

          {serviceError && !isLoadingServices && (
            <Alert variant="destructive" className="mt-2">
              <ServerCrash className="h-4 w-4" />
              <AlertTitle>Error Fetching Services</AlertTitle>
              <AlertDescription>{serviceError}</AlertDescription>
            </Alert>
          )}

          {!isLoadingServices && !serviceError && availableServices.length === 0 && (
            <Alert className="mt-2">
                <MapPin className="h-4 w-4" /> 
                <AlertTitle>No Services Available</AlertTitle>
                <AlertDescription>
                This clinic currently has no services available for online booking. Please select another clinic or check back later.
                </AlertDescription>
            </Alert>
          )}

          {!isLoadingServices && !serviceError && availableServices.length > 0 && (
            <RadioGroup
              value={selectedServiceId || ''}
              onValueChange={handleServiceSelect}
              className="space-y-3 mt-2"
            >
              {availableServices.map((service) => (
                <Label
                  key={service.id}
                  htmlFor={service.id} 
                  className={cn(
                    'flex items-center space-x-3 rounded-md border border-input p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/70',
                    selectedServiceId === service.id && 'border-2 border-primary ring-2 ring-primary/30 bg-primary/5 dark:bg-primary/10'
                  )}
                >
                  <RadioGroupItem value={service.id} id={service.id} className="flex-shrink-0"/>
                  <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-2 sm:mb-0">
                      <p className="font-medium text-base">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.duration || 'Duration not specified'}
                      </p>
                      {service.description && <p className="text-xs text-muted-foreground mt-1">{service.description}</p>}
                    </div>
                    <p className="font-semibold text-sm sm:text-base text-primary sm:text-right">
                        {service.price !== undefined && service.price !== null ? `₱${service.price.toFixed(2)}` : 'Price not available'}
                    </p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          )}
        </div>
      )}
    </div>
  );
};

export default ClinicServiceSelectionStep; 