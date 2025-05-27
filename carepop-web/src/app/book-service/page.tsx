'use client';

import React from 'react';
import { BookingProvider, useBookingContext } from '@/lib/contexts/BookingContext';
import ClinicServiceSelectionStep from './components/ClinicServiceSelectionStep';
import ProviderSelectionStep from './components/ProviderSelectionStep';
import DateTimeSelectionStep from './components/DateTimeSelectionStep';
import ConfirmationStep from './components/ConfirmationStep';
import BookingSuccessStep from './components/BookingSuccessStep';

// Placeholder for the actual Stepper component from Shadcn/ui or custom
const Stepper = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="mb-8 w-full">
      <p className="text-center text-sm text-gray-600">
        Step {currentStep} of {totalSteps}
      </p>
      <div className="mt-2 flex w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};

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

  const TOTAL_BOOKING_STEPS = 4; 

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-center mb-2 text-primary">Book Your Service</h1>
      <p className="text-center text-gray-700 mb-8">
        Follow the steps below to schedule your appointment.
      </p>
      
      {/* Hide stepper on success page (step 5) */}
      {currentStep <= TOTAL_BOOKING_STEPS && (
        <Stepper currentStep={currentStep} totalSteps={TOTAL_BOOKING_STEPS} />
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