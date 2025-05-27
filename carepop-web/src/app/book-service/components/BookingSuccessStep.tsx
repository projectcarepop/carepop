'use client';

import React from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

const BookingSuccessStep: React.FC = () => {
  const { state, dispatch } = useBookingContext();
  const { bookingConfirmation } = state;

  const handleBookAnother = () => {
    dispatch({ type: 'RESET_BOOKING_STATE' });
  };

  if (!bookingConfirmation) {
    return (
      <Card className="w-full text-center">
        <CardHeader>
          <CardTitle>Booking Status Unknown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">We could not find your booking confirmation details.</p>
          <Button onClick={handleBookAnother}>Start a New Booking</Button>
        </CardContent>
      </Card>
    );
  }

  // For date-fns, literal strings are enclosed in single quotes within the format string.
  // eslint-disable-next-line prettier/prettier, quotes 
  const dateFormatString = "PPP 'at' p"; // Linter disable for specific date-fns requirement

  return (
    <Card className="w-full text-center">
      <CardHeader className="items-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mb-3" />
        <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
        <CardDescription>
          Your appointment has been successfully scheduled.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-left bg-muted p-4 rounded-lg space-y-2 text-sm">
          <p><strong>Appointment ID:</strong> {bookingConfirmation.appointmentId}</p>
          <p><strong>Status:</strong> <span className="capitalize">{bookingConfirmation.status.replace('_',' ')}</span></p>
          <p><strong>Clinic:</strong> {bookingConfirmation.clinicName}</p>
          <p><strong>Service:</strong> {bookingConfirmation.serviceName}</p>
          <p><strong>Provider:</strong> {bookingConfirmation.providerName}</p>
          <p><strong>Date & Time:</strong> {format(parseISO(bookingConfirmation.startTime), dateFormatString)}</p>
        </div>
        <p className="text-muted-foreground text-sm">
          You will receive an email confirmation shortly. Please check your spam folder if you don't see it.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <Button onClick={handleBookAnother} variant="outline">Book Another Service</Button>
            <Button asChild>
                <Link href="/dashboard/appointments">View My Appointments</Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingSuccessStep; 