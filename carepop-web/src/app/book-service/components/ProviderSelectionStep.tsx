'use client';

import React, { useEffect } from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { Provider } from '@/lib/types/booking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UserCircle } from 'lucide-react';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

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

  useEffect(() => {
    if (selectedClinic && selectedService) {
      if (selectedService.requiresProviderAssignment === false) {
        // Service does not require a provider, so skip this step.
        dispatch({ type: 'SELECT_PROVIDER', payload: null }); // Ensure provider is cleared
        dispatch({ type: 'SET_PROVIDERS_SUCCESS', payload: [] }); // Clear any existing providers
        dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
        return; // Important to prevent fetching providers
      }

      dispatch({ type: 'SET_PROVIDERS_LOADING', payload: true });
      // API Call: GET /api/v1/providers (Backend Integration Guide - Section 2.1)
      // Query Parameters: clinicId, serviceId
      const queryParams = new URLSearchParams({
        serviceId: selectedService.id,
      }).toString();
      
      // Fetch with Auth
      const supabase = createSupabaseBrowserClient();
      supabase.auth.getSession().then(({ data: sessionData, error: sessionError }) => {
        if (sessionError || !sessionData.session) {
          console.error("Error getting session or no session for provider fetch:", sessionError);
          dispatch({ type: 'SET_PROVIDERS_ERROR', payload: 'Your session is invalid. Please log in again.' });
          dispatch({ type: 'SET_PROVIDERS_LOADING', payload: false });
          return;
        }
        const token = sessionData.session.access_token;

        fetch(`/api/v1/clinics/${selectedClinic.id}/providers?${queryParams}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        })
          .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
          .then(data => {
            if (data.success) {
              dispatch({ type: 'SET_PROVIDERS_SUCCESS', payload: data.data as Provider[] });
            } else {
              dispatch({ type: 'SET_PROVIDERS_ERROR', payload: data.message || 'Failed to fetch providers.' });
            }
          })
          .catch((error) => {
            console.error("Error fetching providers:", error);
            dispatch({ type: 'SET_PROVIDERS_ERROR', payload: error.message || 'An error occurred while fetching providers.' });
          })
          .finally(() => {
            // Ensure loading is set to false in context if not handled by success/error dispatches specifically for this scenario
            // However, current SET_PROVIDERS_SUCCESS/ERROR actions already set loading to false.
          });
      });
    } else {
        // Clear providers if clinic or service is not selected
        dispatch({ type: 'SET_PROVIDERS_SUCCESS', payload: [] });
    }
  }, [selectedClinic, selectedService, dispatch]);

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
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Step 2: Select Provider</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="default">
                    <AlertTitle>Missing Information</AlertTitle>
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Step 2: Select Provider</CardTitle>
        <CardDescription>
          Choose a provider for {selectedService.name} at {selectedClinic.name}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading.providersForService && <div className="flex items-center space-x-2"><Loader2 className="h-5 w-5 animate-spin" /> <span>Loading available providers...</span></div>}
        {errors.providersForService && <Alert variant="destructive"><AlertTitle>Error Loading Providers</AlertTitle><AlertDescription>{errors.providersForService}</AlertDescription></Alert>}
        
        {!isLoading.providersForService && providersForService.length === 0 && !errors.providersForService && (
          <Alert>
            <AlertTitle>No Providers Available</AlertTitle>
            <AlertDescription>
              There are currently no providers available for the selected service at this clinic. Please try a different service or clinic.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading.providersForService && providersForService.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providersForService.map((provider) => (
              <Button 
                key={provider.id} 
                variant={selectedProvider?.id === provider.id ? "default" : "outline"} 
                className="h-auto p-4 flex flex-col items-center justify-center text-center space-y-2 border rounded-lg transition-all duration-150 ease-in-out focus:ring-2 focus:ring-primary"
                onClick={() => handleProviderSelect(provider)}
              >
                {provider.photoUrl ? (
                  <Image 
                    src={provider.photoUrl} 
                    alt={provider.fullName} 
                    width={80} 
                    height={80} 
                    className="rounded-full object-cover w-20 h-20 mb-2"
                  />
                ) : (
                  <UserCircle className="w-20 h-20 text-gray-400 mb-2" />
                )}
                <p className="font-semibold text-md">{provider.fullName}</p>
                <p className="text-xs text-muted-foreground">{provider.specialty}</p>
                <p className={`text-xs ${provider.acceptingNewPatients ? 'text-green-600' : 'text-red-600'}`}>
                  {provider.acceptingNewPatients ? 'Accepting new patients' : 'Not accepting new patients'}
                </p>
              </Button>
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