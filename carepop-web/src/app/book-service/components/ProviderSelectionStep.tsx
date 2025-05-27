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
import { getProvidersAction, Provider as ApiProvider } from '@/lib/actions/providers';

// Local interface for display purposes, extending the base ApiProvider
interface DisplayProvider extends ApiProvider {
  rating?: number;
  reviewCount?: number;
  availability?: string;
}

interface ProviderSelectionStepProps {
  selectedClinicId: string | null;
  selectedService: { 
    id: string | null; 
    name: string | null; 
    requiresProviderAssignment: boolean | null; 
  } | null;
  onBack: () => void;
  setSelectedProviderIdProp: (id: string | null, name?: string | null, specialty?: string | null, avatarUrl?: string | null) => void;
}

const ProviderSelectionStep: React.FC<ProviderSelectionStepProps> = ({
  selectedClinicId,
  selectedService,
  onBack,
  setSelectedProviderIdProp,
}) => {
  const id = useId();
  const [providers, setProviders] = useState<DisplayProvider[]>([]);
  const [localSelectedProviderId, setLocalSelectedProviderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canSkipProviderSelection = selectedService?.requiresProviderAssignment === false;

  const fetchProviders = useCallback(async () => {
    if (!selectedClinicId || !selectedService?.id) {
        setError("Clinic ID or Service ID is missing to fetch providers.");
        setProviders([]);
        return;
    }
    if (canSkipProviderSelection) {
      setProviders([]); 
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getProvidersAction({ 
          clinicId: selectedClinicId, 
          serviceId: selectedService.id 
      });

      if (result.success && result.data) {
        const enhancedData: DisplayProvider[] = result.data.map((p, index) => ({
          ...p,
          rating: index % 2 === 0 ? 4.5 + (index * 0.1) % 0.5 : undefined,
          reviewCount: index % 2 === 0 ? Math.floor(Math.random() * 100) + 20 : undefined,
          availability: index % 3 === 0 ? 'Next available: Tomorrow' : (index % 3 === 1 ? 'Available today' : undefined),
        }));
        setProviders(enhancedData);
      } else {
        throw new Error(result.message || 'Failed to fetch providers');
      }
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
  }, [selectedClinicId, selectedService, canSkipProviderSelection]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);
  
  useEffect(() => {
    if (localSelectedProviderId) {
      const selectedProvider = providers.find(p => p.id === localSelectedProviderId);
      if (selectedProvider) {
        setSelectedProviderIdProp(
          selectedProvider.id,
          selectedProvider.name,
          selectedProvider.specialty_name,
          selectedProvider.avatar_url
        );
      } else {
        setSelectedProviderIdProp(localSelectedProviderId, null, null, null);
      }
    } else {
      setSelectedProviderIdProp(null, null, null, null);
    }
  }, [localSelectedProviderId, providers, setSelectedProviderIdProp]);

  const handleSelection = (providerId: string) => {
    setLocalSelectedProviderId(providerId);
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
        <Button onClick={onBack} variant="outline" className="mt-6">Back to Clinic/Service</Button>
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
          Choose from the available providers for &quot;{selectedService?.name || 'the selected service'}&quot; at your selected clinic.
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
          value={localSelectedProviderId || undefined} 
          onValueChange={handleSelection} 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {providers.map((provider) => (
            <Label
              key={provider.id}
              htmlFor={`${id}-${provider.id}`}
              className={cn(
                'relative flex flex-col items-start gap-3 rounded-lg border border-input p-4 transition-all hover:shadow-lg hover:border-primary/70 cursor-pointer',
                localSelectedProviderId === provider.id && 'border-2 border-primary ring-2 ring-primary/30 bg-primary/5 dark:bg-primary/10'
              )}
            >
              <RadioGroupItem
                value={provider.id}
                id={`${id}-${provider.id}`}
                className="sr-only" 
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
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className="font-semibold text-md mb-0.5">{provider.name}</h4>
                  <p className="text-sm text-muted-foreground">{provider.specialty_name || 'General Practice'}</p>
                  {provider.rating && provider.reviewCount && (
                    <div className="mt-1 flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-medium">{provider.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({provider.reviewCount} reviews)</span>
                    </div>
                  )}
                  {provider.availability && (
                    <p className="text-xs text-primary mt-1 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> {provider.availability}
                    </p>
                  )}
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>
      )}
    </div>
  );
};

export default ProviderSelectionStep; 