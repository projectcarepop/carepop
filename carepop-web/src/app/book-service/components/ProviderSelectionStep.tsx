'use client';

import * as React from 'react';
import { useId, useState, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Calendar, Star, User, Verified, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { toast } from 'sonner';
import { useAuth } from '@/lib/contexts/AuthContext';

// Interface for the provider data fetched from the API
interface ApiProvider {
  id: string;
  name: string; // Combination of first_name and last_name
  specialty_name: string | null;
  avatar_url: string | null;
  // Mocked fields, as the current API does not return these
  // In a real scenario, the API would provide these or they'd be derived.
  rating?: number;
  reviewCount?: number;
  availability?: string;
}

interface ProviderSelectionStepProps {
  selectedClinicId: string | null;
  selectedService: { 
    id: string | null; 
    name: string | null; 
    requires_provider_assignment: boolean | null; 
  } | null;
  onNext: (selectedProviderId: string | null) => void;
  onBack: () => void;
}

const ProviderSelectionStep: React.FC<ProviderSelectionStepProps> = ({
  selectedClinicId,
  selectedService,
  onNext,
  onBack,
}) => {
  const id = useId();
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const canSkipProviderSelection = selectedService?.requires_provider_assignment === false;

  const fetchProviders = useCallback(async () => {
    if (!selectedClinicId) return;
    if (canSkipProviderSelection) {
      setProviders([]); // No need to fetch if skippable
      return;
    }

    if (!session?.access_token) {
      setError('Authentication token not found. Please ensure you are logged in.');
      setIsLoading(false);
      toast.error('Authentication Error', { description: 'Session token is missing.' });
      return;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL; // Get the base URL
    if (!backendUrl) {                                          // Check if it's defined
      setError('Backend API URL is not configured.');
      setIsLoading(false);
      toast.error('Configuration Error', { description: 'Backend API URL is missing.' });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Construct query parameters, serviceId is optional for this endpoint
      const queryParams = new URLSearchParams();
      if (selectedService?.id) {
        queryParams.append('serviceId', selectedService.id);
      }

      // Construct the full URL
      const apiUrl = `${backendUrl.replace(/\/$/, '')}/api/v1/clinics/${selectedClinicId}/providers?${queryParams.toString()}`;
      
      console.log('[ProviderSelectionStep] Fetching providers from:', apiUrl); // Add this log

      const response = await fetch(
        apiUrl, // Use the full, absolute URL
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch providers' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: ApiProvider[] = await response.json();
      // Add mock rating/reviews/availability for UI demonstration as API doesn't provide them yet
      const enhancedData = data.map((p, index) => ({
        ...p,
        rating: index % 2 === 0 ? 4.5 + (index * 0.1) % 0.5 : undefined,
        reviewCount: index % 2 === 0 ? Math.floor(Math.random() * 100) + 20 : undefined,
        availability: index % 3 === 0 ? 'Next available: Tomorrow' : (index % 3 === 1 ? 'Available today' : undefined),
      }));
      setProviders(enhancedData);
    } catch (e: unknown) {
      console.error('Error fetching providers:', e);
      let errorMessage = 'An unexpected error occurred.';
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      setError(errorMessage);
      toast.error('Error fetching providers', { description: errorMessage });
    }
    setIsLoading(false);
  }, [selectedClinicId, selectedService, canSkipProviderSelection, session]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleNext = () => {
    if (canSkipProviderSelection) {
      onNext(null); // Pass null if provider selection is skipped
    } else if (selectedProviderId) {
      onNext(selectedProviderId);
    } else {
      // This case should ideally be prevented by disabling the Next button
      toast.warning('Please select a provider', { description: 'You must choose a provider to continue.'});
    }
  };

  if (!selectedClinicId || !selectedService?.id) {
    return (
      <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center min-h-[200px] flex flex-col justify-center items-center">
        <User className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">
          Please select a clinic and service first.
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Provider selection will be available once a clinic and service are chosen.
        </p>
        <Button onClick={onBack} variant="outline" className="mt-6">Back to Service Selection</Button>
      </div>
    );
  }
  
  if (canSkipProviderSelection) {
    return (
      <div className="rounded-lg border border-border p-8 text-center min-h-[200px] flex flex-col justify-center items-center bg-muted/20">
        <Verified className="w-12 h-12 text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-foreground">
          No Provider Selection Needed
        </h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          The selected service &quot;{selectedService.name}&quot; does not require you to choose a specific provider.
        </p>
        <div className="flex gap-3">
            <Button onClick={onBack} variant="outline">Back</Button>
            <Button onClick={() => onNext(null)}>Continue to Next Step</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6')}>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-center sm:text-left">
          Select Your Healthcare Provider
        </h3>
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          Choose from the available providers for &quot;{selectedService.name}&quot; at your selected clinic.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center min-h-[200px] flex-col">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading available providers...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center min-h-[200px] flex flex-col justify-center items-center">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-destructive">Error Loading Providers</h3>
          <p className="text-sm text-destructive/80 mt-1 mb-4">
            {error}
          </p>
          <Button onClick={fetchProviders} variant="destructive">Try Again</Button>
        </div>
      )}

      {!isLoading && !error && providers.length === 0 && (
         <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center min-h-[200px] flex flex-col justify-center items-center">
          <User className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No Providers Available</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Unfortunately, there are no providers matching your current clinic and service selection.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Please try changing the clinic or service, or check back later.
          </p>
        </div>
      )}

      {!isLoading && !error && providers.length > 0 && (
        <RadioGroup
          value={selectedProviderId || undefined}
          onValueChange={setSelectedProviderId}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {providers.map((provider) => (
            <Label
              key={provider.id}
              htmlFor={`${id}-${provider.id}`}
              className={cn(
                'relative flex flex-col items-start gap-3 rounded-lg border border-input p-4 transition-all hover:shadow-lg hover:border-primary/70 cursor-pointer',
                selectedProviderId === provider.id && 'border-2 border-primary ring-2 ring-primary/30 bg-primary/5 dark:bg-primary/10'
              )}
            >
              <RadioGroupItem
                value={provider.id}
                id={`${id}-${provider.id}`}
                className="sr-only" // Hide the actual radio button, selection is via card click
              />
              <div className="flex items-start gap-4 w-full">
                <div className="relative h-16 w-16 rounded-full overflow-hidden shrink-0 border bg-muted flex items-center justify-center">
                  {provider.avatar_url ? (
                    <>
                      <Image
                        src={provider.avatar_url} 
                        alt={`${provider.name}'s avatar`}
                        width={64}
                        height={64}
                        className="object-cover peer"
                        onError={(e) => { 
                          // Hide image and show fallback directly
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.avatar-fallback');
                          if (fallback) (fallback as HTMLElement).style.display = 'flex';
                        }}
                      />
                      <div className="avatar-fallback peer-error:flex hidden h-full w-full items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </>
                  ) : (
                     <div className="h-full w-full flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                     </div>
                  )}
                </div>
                <div className="grid grow gap-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base leading-tight">{provider.name}</h4>
                    {selectedProviderId === provider.id && (
                      <Verified className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">{provider.specialty_name || 'General Practice'}</p>
                  
                  {(provider.rating && provider.reviewCount) ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3.5 w-3.5",
                              i < provider.rating! 
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-muted text-muted-foreground/60"
                            )}
                          />
                        ))}
                      </div>
                      <span className="ml-1">({provider.reviewCount} reviews)</span>
                    </div>
                  ) : (
                    <div className="h-[18px] mt-1"></div> 
                  )}

                  {provider.availability && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{provider.availability}</span>
                    </div>
                  )}
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>
      )}

      <div className="flex justify-between items-center pt-4">
        <Button onClick={onBack} variant="outline">Back</Button>
        <Button 
            onClick={handleNext} 
            disabled={isLoading || (!canSkipProviderSelection && !selectedProviderId && providers.length > 0)}
        >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Next
        </Button>
      </div>
    </div>
  );
};

export default ProviderSelectionStep; 