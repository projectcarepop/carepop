'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchClinics } from '../../../services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { BookingData } from './BookingFlowManager';
import { type Clinic } from '@/lib/types/bookings';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useDebounce } from 'use-debounce';

interface Step1_ClinicSelectionProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  setSelectionMade: (isSelected: boolean) => void;
}

export const Step1_ClinicSelection: React.FC<Step1_ClinicSelectionProps> = ({ 
  bookingData, 
  updateBookingData, 
  setSelectionMade 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500); // 500ms delay

  const { data: clinics, isLoading, isError, error } = useQuery({
    queryKey: ['clinics', debouncedSearchTerm],
    queryFn: () => searchClinics({ q: debouncedSearchTerm }),
    // The API now returns the filtered array directly, no `select` needed.
  });

  const handleSelect = (clinic: Clinic) => {
    updateBookingData({ clinic });
    setSelectionMade(true);
  };

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
        <CardTitle>Step 1: Find a Clinic Near You</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Input 
            type="text"
            placeholder="Search for a clinic by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isLoading ? (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="mr-2 h-8 w-8 animate-spin" />
                <span>Searching...</span>
            </div>
        ) : clinics && clinics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
            {clinics.map((clinic: Clinic) => (
                <Card 
                key={clinic.id} 
                className={cn(
                    "cursor-pointer hover:shadow-lg transition-shadow",
                    bookingData.clinic?.id === clinic.id && "ring-2 ring-primary"
                )}
                onClick={() => handleSelect(clinic)}
                >
                <CardHeader>
                    <CardTitle>{clinic.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{typeof clinic.address === 'string' ? clinic.address : 'Address not available'}</p>
                    <div className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                      <p>Mon - Fri: 9am - 5pm</p>
                      <p>Key Services: General Checkup, Therapy</p>
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>
        ) : (
            <div className="text-center text-muted-foreground py-8">
                <p>No clinics found. Try a different search term or leave it blank to see all clinics.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}; 