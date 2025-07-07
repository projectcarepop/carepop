'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPublicClinics } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Info } from 'lucide-react';
import type { BookingData } from './BookingFlowManager';
import { type Clinic } from '@/lib/types/bookings';
import { useRouter } from 'next/navigation';

interface Step1_ClinicSelectionProps {
  updateBookingData: (data: Partial<BookingData>) => void;
  goToNextStep: () => void;
}

export function Step1_ClinicSelection({ updateBookingData, goToNextStep }: Step1_ClinicSelectionProps) {
  const router = useRouter();
  const { data: clinics, isLoading, isError, error } = useQuery({
    queryKey: ['clinics'],
    queryFn: () => getPublicClinics(),
    select: (data) => data.data,
  });

  const handleSelect = (clinic: Clinic) => {
    updateBookingData({ clinic });
    goToNextStep();
  };

  const goToClinicFinder = () => {
    router.push('/find-a-clinic');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[300px]">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading Clinics...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was a problem fetching clinics. Please try again later.
          {error && <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Find a Clinic Near You</h2>
            <p className="text-muted-foreground">Select a clinic to begin your booking</p>
        </div>
      {clinics && clinics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clinics.map((clinic: Clinic) => (
              <Card 
              key={clinic.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow p-4 flex flex-col justify-between"
              onClick={() => handleSelect(clinic)}
              >
                <div>
                    <h3 className="font-semibold">{clinic.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{typeof clinic.address === 'string' ? clinic.address : 'Address not available'}</p>
                </div>
              </Card>
          ))}
          </div>
      ) : (
        <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
            <Info className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No Clinics Available for Direct Booking</h3>
            <p className="mt-1 text-sm text-gray-500">You can browse all clinics or search for one on our clinic finder.</p>
            <div className="mt-6">
                <Button onClick={goToClinicFinder}>
                    Find a Clinic
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}; 