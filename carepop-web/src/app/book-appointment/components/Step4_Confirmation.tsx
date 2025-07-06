'use client';

import React from 'react';
import type { BookingData } from './BookingFlowManager';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Step4_ConfirmationProps {
  bookingData: BookingData;
  goToPreviousStep: () => void;
  // This function would eventually handle the mutation
  confirmBooking: () => void; 
  isBooking: boolean;
}

export const Step4_Confirmation: React.FC<Step4_ConfirmationProps> = ({
  bookingData,
  goToPreviousStep,
  confirmBooking,
  isBooking,
}) => {
  // In a real app, we'd fetch the full details for clinic, service, doctor
  // For now, we'll just display the IDs and the selected slot.

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Confirm Your Appointment</CardTitle>
          <Button variant="ghost" onClick={goToPreviousStep}>Back</Button>
        </div>
        <p className="text-muted-foreground text-sm pt-1">
          Please review the details of your appointment below before confirming.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-lg">Appointment Details</h3>
            <ul className="mt-2 space-y-2 text-sm">
                <li><strong>Clinic ID:</strong> {bookingData.clinicId || 'Not Selected'}</li>
                <li><strong>Service ID:</strong> {bookingData.serviceId || 'Not Selected'}</li>
                <li><strong>Doctor ID:</strong> {bookingData.doctorId || 'Not Selected'}</li>
                <li>
                    <strong>Time:</strong> 
                    {bookingData.slot ? format(bookingData.slot, 'MMMM d, yyyy \'at\' h:mm a') : 'Not Selected'}
                </li>
            </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={confirmBooking}
          disabled={!bookingData.clinicId || !bookingData.serviceId || !bookingData.doctorId || !bookingData.slot || isBooking}
        >
          {isBooking ? 'Booking...' : 'Confirm Booking'}
        </Button>
      </CardFooter>
    </Card>
  );
}; 