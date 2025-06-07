'use client';

import React, { useEffect } from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { Provider } from '@/lib/types/booking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UserCircle, ShieldCheck, ShieldAlert, Info } from 'lucide-react';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

const ProviderSelectionStep: React.FC = () => {
  const { state, dispatch } = useBookingContext();
  const { 
    selectedClinic,
    selectedService,
    selectedProvider,
    providersForService,
    isLoading,
    errors 
  } = state;

  const fetchProvidersForService = async (clinicId: string, serviceId: string) => {
    dispatch({ type: 'SET_PROVIDERS_LOADING', payload: true });

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        console.error("Auth error:", sessionError);
        throw new Error('Your session is invalid. Please log in again.');
      }
      const token = sessionData.session.access_token;
      
      const queryParams = new URLSearchParams({ serviceId }).toString();
      const res = await fetch(`/api/v1/clinics/${clinicId}/providers?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!res.ok) {
        const errorText = res.status === 404 ? 'No providers were found for this service.' : `An unexpected error occurred (Code: ${res.status}).`;
        throw new Error(errorText);
      }

      const data = await res.json();
      if (data.success) {
        dispatch({ type: 'SET_PROVIDERS_SUCCESS', payload: data.data as Provider[] });
      } else {
        throw new Error(data.message || 'Failed to parse provider data.');
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while fetching providers.';
      dispatch({ type: 'SET_PROVIDERS_ERROR', payload: errorMessage });
    }
  };

  useEffect(() => {
    if (selectedClinic && selectedService) {
      if (selectedService.requiresProviderAssignment === false) {
        // Service does not require a provider, so skip this step.
        dispatch({ type: 'SELECT_PROVIDER', payload: null }); // Ensure provider is cleared
        dispatch({ type: 'SET_PROVIDERS_SUCCESS', payload: [] }); // Clear any existing providers
        dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
        return; // Important to prevent fetching providers
      }

      fetchProvidersForService(selectedClinic.id, selectedService.id);
    } else {
        // Clear providers if clinic or service is not selected
        dispatch({ type: 'SET_PROVIDERS_SUCCESS', payload: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClinic, selectedService]);

  const handleProviderSelect = (provider: Provider) => {
    dispatch({ type: 'SELECT_PROVIDER', payload: provider });
  };

  const goToNextStep = () => {
    if (selectedProvider) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
    }
  };

  const goToPreviousStep = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 1 });
  };

  if (!selectedClinic || !selectedService) {
    return (
        <Card className="w-full shadow-xl">
            <CardHeader>
                <CardTitle  className="text-2xl font-bold">Step 2: Select Provider</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="default" className="border-primary/50">
                    <Info className="h-5 w-5 mr-2 text-primary"/>
                    <AlertTitle className="font-semibold text-primary">Missing Information</AlertTitle>
                    <AlertDescription>
                        Please go back to Step 1 and select a clinic and a service first.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter className="flex justify-start">
                <Button variant="outline" onClick={goToPreviousStep}>Back to Clinic & Service</Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Step 2: Select Provider</CardTitle>
        <CardDescription className="text-md">
          Choose a provider for {selectedService.name} at {selectedClinic.name}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading.providersForService && <div className="flex items-center space-x-2 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> <span>Loading available providers...</span></div>}
        
        {errors.providersForService && (
          <Alert variant="destructive" className="mt-2">
            <Info className="h-5 w-5 mr-2"/>
            <AlertTitle>Error Loading Providers</AlertTitle>
            <AlertDescription>
              {errors.providersForService}
              <Button 
                onClick={() => fetchProvidersForService(selectedClinic.id, selectedService.id)} 
                variant="secondary" 
                size="sm" 
                className="ml-4"
                disabled={isLoading.providersForService}
              >
                {isLoading.providersForService && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {!isLoading.providersForService && providersForService.length === 0 && !errors.providersForService && (
          <Alert variant="default" className="border-orange-400/50">
            <Info className="h-5 w-5 mr-2 text-orange-500"/>
            <AlertTitle className="font-semibold text-orange-600">No Providers Available</AlertTitle>
            <AlertDescription>
              There are currently no providers available for the selected service at this clinic. Please try a different service or clinic.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading.providersForService && providersForService.length > 0 && (
          <div className="flex flex-col gap-2">
            {providersForService.map((provider) => (
              <Card 
                key={provider.id} 
                onClick={() => handleProviderSelect(provider)}
                className={cn(
                  "cursor-pointer transition-all duration-150 ease-in-out hover:shadow-md focus-within:ring-1 focus-within:ring-primary focus-within:ring-offset-1 text-center group",
                  selectedProvider?.id === provider.id ? "ring-1 ring-primary shadow-md border-primary" : "border-border bg-card"
                )}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? handleProviderSelect(provider) : null}
              >
                <CardContent className="flex flex-row items-center pt-1 space-x-3">
                  <div className="relative">
                    {provider.photoUrl ? (
                      <Image 
                        src={provider.photoUrl} 
                        alt={provider.fullName} 
                        width={48}
                        height={48}
                        className="rounded-full object-cover w-12 h-12 border-2 border-muted group-hover:border-primary/30 transition-colors"
                      />
                    ) : (
                      <UserCircle className={cn(
                        "w-12 h-12 text-gray-300 group-hover:text-primary/70 transition-colors",
                        selectedProvider?.id === provider.id ? "text-primary/90" : ""
                       )} />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col text-left">
                    <p className={cn(
                       "font-semibold text-sm leading-tight",
                       selectedProvider?.id === provider.id ? "text-primary" : "text-card-foreground"
                      )}>
                      {provider.fullName}
                    </p>
                    <p className={cn(
                      "text-xs font-inter",
                      selectedProvider?.id === provider.id ? "text-primary/80" : "text-muted-foreground"
                    )}>
                      {provider.specialty || 'General Provider'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div className={cn(
                      "flex items-center text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap", 
                      provider.acceptingNewPatients ? 
                        (selectedProvider?.id === provider.id ? "bg-primary/15 text-primary" : "bg-green-100 text-green-700 group-hover:bg-green-200/70") :
                        (selectedProvider?.id === provider.id ? "bg-destructive/10 text-destructive" : "bg-red-100 text-red-700 group-hover:bg-red-200/70"),
                      "transition-colors duration-150"
                    )}>
                      {provider.acceptingNewPatients ? 
                        <ShieldCheck className="h-3.5 w-3.5 mr-1.5 shrink-0" /> : 
                        <ShieldAlert className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                      }
                      {provider.acceptingNewPatients ? 'Accepting New Patients' : 'Not Accepting Patients'}
                    </div>
                    <Button variant="outline" size="sm" className={cn(selectedProvider?.id === provider.id ? "border-primary/50 text-primary hover:bg-primary/5 hover:text-primary" : "")}>
                      Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6 mt-6">
        <Button variant="outline" onClick={goToPreviousStep} disabled={isLoading.providersForService}>Back</Button>
        <Button onClick={goToNextStep} disabled={!selectedProvider || isLoading.providersForService} size="lg">
          Next: Select Date & Time
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProviderSelectionStep; 