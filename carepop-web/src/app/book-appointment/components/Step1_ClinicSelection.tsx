'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchClinics } from '../../../services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, CheckCircle2 } from 'lucide-react';
import type { BookingData } from './BookingFlowManager';
import { type Clinic } from '@/lib/types/bookings';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useDebounce } from 'use-debounce';

// Helper to format the address
function formatAddress(address: any): string {
    if (!address) return 'Address not available';
    if (typeof address === 'string') return address;
    
    const parts = [
        address.street,
        address.city,
        address.province,
        address.zip,
    ].filter(Boolean); // Filter out any null/undefined parts
    
    return parts.join(', ');
}

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
            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto p-4 bg-muted/20 rounded-lg">
            {clinics.map((clinic: Clinic) => {
                const isSelected = bookingData.clinic?.id === clinic.id;
                return (
                    <Card 
                    key={clinic.id} 
                    className={cn(
                        "cursor-pointer hover:shadow-lg transition-shadow relative",
                        isSelected && "ring-2 ring-primary bg-primary/5"
                    )}
                    onClick={() => handleSelect(clinic)}
                    >
                    {isSelected && (
                        <CheckCircle2 className="w-6 h-6 text-primary absolute top-2 right-2" />
                    )}
                    <CardHeader className="p-4">
                        <CardTitle className="text-base">{clinic.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="flex items-start gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                            <p className="text-sm">{formatAddress(clinic.address)}</p>
                        </div>
                    </CardContent>
                    </Card>
                )
            })}
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