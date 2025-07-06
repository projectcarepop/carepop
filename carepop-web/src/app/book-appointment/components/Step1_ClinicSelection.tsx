'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClinics } from '../../../services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { BookingData } from './BookingFlowManager';

interface Step1_ClinicSelectionProps {
  updateBookingData: (data: Partial<BookingData>) => void;
  goToNextStep: () => void;
}

export const Step1_ClinicSelection: React.FC<Step1_ClinicSelectionProps> = ({ updateBookingData, goToNextStep }) => {
  const { data: clinics, isLoading, isError, error } = useQuery({
    queryKey: ['clinics'],
    queryFn: getClinics,
  });

  const handleSelect = (clinicId: string) => {
    updateBookingData({ clinicId });
    goToNextStep();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
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
    <Card>
      <CardHeader>
        <CardTitle>Find a Clinic Near You</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clinics?.map((clinic: any) => (
            <Card 
              key={clinic.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleSelect(clinic.id)}
            >
              <CardHeader>
                <CardTitle>{clinic.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{clinic.address}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}; 