'use client';

import React from 'react';
import type { BookingData } from './BookingFlowManager';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Loader2, Home, Stethoscope, User, CalendarDays } from 'lucide-react';

// Helper to format the address
function formatAddress(address: any): string {
    if (!address) return '';
    if (typeof address === 'string') return address;
    
    const parts = [
        address.street,
        address.city,
        address.province,
        address.zip,
    ].filter(Boolean); // Filter out any null/undefined parts
    
    return parts.join(', ');
}

interface Step4_ConfirmationProps {
  bookingData: BookingData;
  confirmBooking: () => void; 
  isBooking: boolean;
}

export const Step4_Confirmation: React.FC<Step4_ConfirmationProps> = ({
  bookingData,
  confirmBooking,
  isBooking,
}) => {
  // In a real app, we'd fetch the full details for clinic, service, doctor
  // For now, we'll just display the IDs and the selected slot.

  return (
    <Card className="relative">
      {isBooking && (
        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-lg z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-semibold">Confirming your booking...</p>
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Confirm Your Appointment</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm pt-1">
          Please review the details of your appointment below before confirming.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-lg">Appointment Details</h3>
            <ul className="mt-2 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                    <Home className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                        <span className="font-semibold">{bookingData.clinic?.name || 'Not Selected'}</span>
                        <p className="text-muted-foreground text-xs">{formatAddress(bookingData.clinic?.address)}</p>
                    </div>
                </li>
                <li className="flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <span className="font-semibold">{bookingData.service?.name || 'Not Selected'}</span>
                        {bookingData.service && (
                            <span className="text-xs text-muted-foreground ml-1.5">
                                ({bookingData.service.durationMinutes} minutes)
                            </span>
                        )}
                    </div>
                </li>
                <li className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">{bookingData.doctor?.fullName || 'Not Selected'}</span>
                </li>
                <li className="flex items-center gap-3">
                    <CalendarDays className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">
                        {bookingData.slot ? format(bookingData.slot, "MMMM d, yyyy 'at' h:mm a") : 'Not Selected'}
                    </span>
                </li>
            </ul>
        </div>
        <div className="p-4 border-t border-dashed">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Service Fee</dt>
                <dd className="font-semibold">
                  {bookingData.service ? 
                    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(bookingData.service.price) 
                    : 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <dt>Total</dt>
                <dd>
                  {bookingData.service ? 
                    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(bookingData.service.price) 
                    : 'N/A'}
                </dd>
              </div>
            </dl>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={confirmBooking}
          disabled={!bookingData.clinic || !bookingData.service || !bookingData.doctor || !bookingData.slot || isBooking}
        >
          {isBooking ? 'Booking...' : 'Confirm Booking'}
        </Button>
      </CardFooter>
    </Card>
  );
}; 