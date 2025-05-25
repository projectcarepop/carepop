'use client';

import * as React from 'react';
import { Dispatch, SetStateAction, useId } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, Star, User, Verified } from 'lucide-react'; // Removed unused Clock
import { cn } from '@/lib/utils';
import Image from 'next/image'; 

// Mock Data (Ideally, this would come from props or a context/API call based on selectedClinicId and selectedServiceId)
interface Provider {
  id: string;
  name: string;
  specialty: string; // Changed from role
  rating?: number; // Made optional
  reviewCount?: number; // Made optional
  availability?: string; // Made optional, could be more structured
  avatarUrl?: string; // Changed from avatar, made optional
  // Add clinicId and serviceId if filtering mock data directly here
  clinicIds: string[]; 
  serviceIds: string[];
}

const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'provider-101',
    name: 'Dr. Angela Merkel',
    specialty: 'General Practitioner',
    rating: 4.8,
    reviewCount: 124,
    availability: 'Next available: Tomorrow',
    avatarUrl: '/images/avatars/provider-female-1.jpg', // Placeholder path
    clinicIds: ['clinic-1', 'clinic-2'],
    serviceIds: ['service-a1', 'service-b2']
  },
  {
    id: 'provider-102',
    name: 'Dr. Ben Carson',
    specialty: 'Pediatrician',
    rating: 4.9,
    reviewCount: 89,
    availability: 'Available today',
    avatarUrl: '/images/avatars/provider-male-1.jpg', // Placeholder path
    clinicIds: ['clinic-1', 'clinic-3'],
    serviceIds: ['service-a1']
  },
  {
    id: 'provider-103',
    name: 'Dr. Condoleezza Rice',
    specialty: 'Cardiologist',
    rating: 4.7,
    reviewCount: 56,
    avatarUrl: '/images/avatars/provider-female-2.jpg', // Placeholder path
    clinicIds: ['clinic-2', 'clinic-3'],
    serviceIds: ['service-c3', 'service-d4']
  },
  {
    id: 'provider-104',
    name: 'Dr. John Smith (No Reviews)',
    specialty: 'General Practitioner',
    clinicIds: ['clinic-1'],
    serviceIds: ['service-a1', 'service-b2', 'service-d4']
  },
];

interface ProviderSelectionStepProps {
  selectedClinicId: string | null;
  selectedServiceId: string | null;
  selectedProviderId: string | null;
  setSelectedProviderId: Dispatch<SetStateAction<string | null>>;
}

const ProviderSelectionStep: React.FC<ProviderSelectionStepProps> = ({
  selectedClinicId,
  selectedServiceId,
  selectedProviderId,
  setSelectedProviderId,
}) => {
  const id = useId();

  // Filter providers based on selected clinic and service
  // This is a simplified mock filtering. In a real app, an API call would fetch relevant providers.
  const availableProviders = MOCK_PROVIDERS.filter(provider => 
    selectedClinicId && provider.clinicIds.includes(selectedClinicId) &&
    selectedServiceId && provider.serviceIds.includes(selectedServiceId)
  );

  if (!selectedClinicId || !selectedServiceId) {
    return (
      <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center min-h-[200px] flex flex-col justify-center items-center">
        <User className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">
          Please select a clinic and service first.
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Provider selection will be available once a clinic and service are chosen.
        </p>
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
          Choose from the available providers for your selected service.
        </p>
      </div>

      {availableProviders.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center min-h-[200px] flex flex-col justify-center items-center">
          <User className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No Providers Available</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Unfortunately, there are no providers matching your current clinic and service selection.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Please try changing the clinic or service.
          </p>
        </div>
      ) : (
        <RadioGroup
          value={selectedProviderId || undefined}
          onValueChange={setSelectedProviderId}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {availableProviders.map((provider) => (
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
                  {provider.avatarUrl ? (
                    <Image
                      src={provider.avatarUrl}
                      alt={`${provider.name}'s avatar`}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="grid grow gap-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base leading-tight">{provider.name}</h4>
                    {selectedProviderId === provider.id && (
                      <Verified className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">{provider.specialty}</p>
                  
                  {(provider.rating && provider.reviewCount) ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3.5 w-3.5",
                              i < provider.rating! // Non-null assertion as we checked
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-muted text-muted-foreground/60"
                            )}
                          />
                        ))}
                      </div>
                      <span className="ml-1">({provider.reviewCount} reviews)</span>
                    </div>
                  ) : (
                    <div className="h-[18px] mt-1"></div> // Placeholder for spacing if no rating
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
    </div>
  );
};

export default ProviderSelectionStep; 