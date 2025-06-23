'use client';

import React from 'react';
import { BookingProvider, useBookingContext } from '@/lib/contexts/BookingContext';
import ClinicServiceSelectionStep from './components/ClinicServiceSelectionStep';
import DateTimeSelectionStep from './components/DateTimeSelectionStep';
import ConfirmationStep from './components/ConfirmationStep';
import BookingSuccessStep from './components/BookingSuccessStep';
import BookingProgressIndicator from './components/BookingProgressIndicator';
import { Card, CardContent } from '@/components/ui/card';

// Define the steps array for the new, simplified flow
const bookingFlowSteps = [
  {
    id: 'clinicServiceSelection',
    name: 'Clinic & Service',
    description: 'Find your clinic and service.',
  },
  {
    id: 'dateTimeSelection',
    name: 'Date & Time',
    description: 'Pick a date and time.',
  },
  {
    id: 'confirmation',
    name: 'Confirm',
    description: 'Review your booking.',
  },
];

const BookingFlowManager: React.FC = () => {
  const { state } = useBookingContext();
  const { currentStep, bookingConfirmation } = state;

  // If we have a booking confirmation, we are done. Show the success step.
  if (bookingConfirmation) {
    return <BookingSuccessStep />;
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ClinicServiceSelectionStep />;
      case 2:
        return <DateTimeSelectionStep />;
      case 3:
        return <ConfirmationStep />;
      default:
        // Fallback to step 1
        return <ClinicServiceSelectionStep />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Show progress indicator only during the booking flow */}
      <div className="mb-8">
        <BookingProgressIndicator 
          steps={bookingFlowSteps} 
          currentStepIndex={currentStep - 1} // Adjust index because steps array is 0-indexed
        />
      </div>
      
      <Card className="p-0 overflow-hidden">
        <CardContent className="p-4 sm:p-8">
            {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  );
};

const BookServicePageClient = () => {
  return (
    <BookingProvider>
        <>
            {/* Hero Section */}
            <section className="w-full py-16 md:py-20 lg:py-24 bg-muted">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-space-grotesk text-primary">
                            Book Your Service
                        </h1>
                        <p className="max-w-[800px] text-muted-foreground md:text-xl font-inter">
                            Follow the steps below to schedule your appointment with ease.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Booking Section */}
            <section className="w-full py-16 md:py-20 lg:py-24">
                <BookingFlowManager />
            </section>
      </>
    </BookingProvider>
  );
};

export default BookServicePageClient; 