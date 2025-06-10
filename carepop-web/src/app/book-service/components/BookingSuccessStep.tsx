'use client';

import React from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Info } from 'lucide-react';
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
      <Card className="w-full text-center shadow-xl">
        <CardHeader className="items-center">
            <Info className="h-16 w-16 text-orange-500 mb-3" />
            <CardTitle className="text-2xl font-bold">Booking Status Unknown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6 text-md">We could not find your booking confirmation details.</p>
          <Button onClick={handleBookAnother} size="lg">Start a New Booking</Button>
        </CardContent>
      </Card>
    );
  }

  // For date-fns, literal strings are enclosed in single quotes within the format string.
  const dateFormatString = "PPP 'at' p"; // Linter disable for specific date-fns requirement

  return (
    <Card className="w-full text-center shadow-xl">
      <CardHeader className="items-center">
        <CalendarCheck className="h-20 w-20 text-green-500 mb-4" />
        <CardTitle className="text-3xl font-bold text-green-600">Booking Confirmed!</CardTitle>
        <CardDescription className="text-md pt-1">
          Your appointment has been successfully scheduled.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-6 pb-6">
        <div className="text-left bg-green-50 border border-green-200 p-5 rounded-lg space-y-2.5 text-sm shadow-sm">
          <p className="flex justify-between items-center"><strong>Appointment ID:</strong> <span className="font-mono text-xs bg-green-100 px-2 py-0.5 rounded">{bookingConfirmation.appointmentId}</span></p>
          <hr className="border-green-200"/>
          <p><strong>Status:</strong> <span className="capitalize font-semibold text-green-700">{bookingConfirmation.status.replace('_',' ')}</span></p>
          <p><strong>Clinic:</strong> {bookingConfirmation.clinicName}</p>
          <p><strong>Service:</strong> {bookingConfirmation.serviceName}</p>
          <p><strong>Provider:</strong> {bookingConfirmation.providerName}</p>
          <p><strong>Date & Time:</strong> <span className="font-semibold">{format(parseISO(bookingConfirmation.appointment_datetime), dateFormatString)}</span></p>
        </div>
        <p className="text-muted-foreground text-sm pt-2">
          You will receive an email confirmation shortly. Please check your spam folder if you don&apos;t see it.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-5">
            <Button onClick={handleBookAnother} variant="outline" size="lg">Book Another Service</Button>
            <Button asChild size="lg">
                <Link href="/dashboard/appointments">View My Appointments</Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingSuccessStep; 