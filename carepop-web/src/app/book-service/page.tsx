'use client';

import React from 'react';
import { BookingProvider, useBookingContext } from '@/lib/contexts/BookingContext';
import ClinicServiceSelectionStep from './components/ClinicServiceSelectionStep';
import ProviderSelectionStep from './components/ProviderSelectionStep';
import DateTimeSelectionStep from './components/DateTimeSelectionStep';
import ConfirmationStep from './components/ConfirmationStep';
import BookingSuccessStep from './components/BookingSuccessStep';
import BookingProgressIndicator from './components/BookingProgressIndicator';

// Define the steps array (similar to BookingForm.tsx)
const bookingFlowSteps = [
  {
    id: 'clinicServiceSelection',
    name: 'Clinic & Service',
    description: 'Find your clinic and service.',
  },
  {
    id: 'providerSelection',
    name: 'Provider',
    description: 'Choose a provider.',
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

  const renderStepContent = () => {
    // Step 5 is the success/confirmation display page
    if (bookingConfirmation && currentStep === 5) { 
      return <BookingSuccessStep />;
    }
    switch (currentStep) {
      case 1:
        return <ClinicServiceSelectionStep />;
      case 2:
        return <ProviderSelectionStep />;
      case 3:
        return <DateTimeSelectionStep />;
      case 4:
        return <ConfirmationStep />;
      default:
        // Fallback to step 1 or an error message if step is invalid and not success
        return <ClinicServiceSelectionStep />;
    }
  };

  const TOTAL_BOOKING_STEPS = bookingFlowSteps.length; // Use the length of the new array

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-2 text-primary">Book Your Service</h1>
      <p className="text-center text-gray-700 mb-8">
        Follow the steps below to schedule your appointment.
      </p>
      
      {/* Use BookingProgressIndicator if not on success page (currentStep 5) */}
      {currentStep <= TOTAL_BOOKING_STEPS && currentStep !== 0 && currentStep !== 5 && (
        <BookingProgressIndicator 
          steps={bookingFlowSteps} 
          currentStepIndex={currentStep -1} // Adjust index because steps array is 0-indexed
        />
      )}
      
      <div className="p-0 sm:p-6 bg-white sm:shadow-xl sm:rounded-lg">
        {renderStepContent()}
      </div>
    </div>
  );
};

const BookServicePage = () => {
  return (
    <BookingProvider>
      <BookingFlowManager />
    </BookingProvider>
  );
};

export default BookServicePage; 