'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { Button } from '@/components/ui/button';
import ClinicServiceSelectionStep from './ClinicServiceSelectionStep'; // Import the step component
import ProviderSelectionStep from './ProviderSelectionStep'; // Import the new step component
import DateTimeSelectionStep from './DateTimeSelectionStep'; // Import the new step component
import ConfirmationStep from './ConfirmationStep'; // Import the new step component
import BookingProgressIndicator from './BookingProgressIndicator'; // Import the new indicator
import { cn } from '@/lib/utils'; // Import cn for conditional classes

// Define a type for the props passed to step components
interface StepProps {
  selectedClinicId: string | null;
  setSelectedClinicId: Dispatch<SetStateAction<string | null>>;
  selectedServiceId: string | null;
  setSelectedServiceId: Dispatch<SetStateAction<string | null>>;
  selectedProviderId: string | null;
  setSelectedProviderId: Dispatch<SetStateAction<string | null>>;
  selectedDate: Date | undefined;
  setSelectedDate: Dispatch<SetStateAction<Date | undefined>>;
  selectedTimeSlot: string | null;
  setSelectedTimeSlot: Dispatch<SetStateAction<string | null>>;
  appointmentNotes?: string; // Add notes state to StepProps
  setAppointmentNotes?: Dispatch<SetStateAction<string>>; // Add notes setter
}

const steps = [
  {
    id: 'clinicServiceSelection',
    name: 'Select Clinic & Service',
    component: ClinicServiceSelectionStep,
  },
  {
    id: 'providerSelection',
    name: 'Select Provider',
    component: ProviderSelectionStep, // Add component here
  },
  {
    id: 'dateTimeSelection',
    name: 'Select Date & Time',
    component: DateTimeSelectionStep, // Add component here
  },
  {
    id: 'confirmation',
    name: 'Confirm Booking',
    component: ConfirmationStep, // Add component here
  },
];

export default function BookingForm() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);

  // State for selected clinic and service
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null); // State for provider
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined); // State for date
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null); // State for time slot
  const [appointmentNotes, setAppointmentNotes] = useState<string>(""); // State for notes

  useEffect(() => {
    const clinicIdFromUrl = searchParams.get('clinicId');
    const serviceIdFromUrl = searchParams.get('serviceId');
    if (clinicIdFromUrl) {
      setSelectedClinicId(clinicIdFromUrl);
    }
    if (serviceIdFromUrl) {
      setSelectedServiceId(serviceIdFromUrl);
    }
    // Reset subsequent selections if earlier ones change
    setSelectedProviderId(null);
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    setAppointmentNotes(""); // Reset notes too
  }, [searchParams, selectedClinicId, selectedServiceId]); // Extended dependencies

  // Effect to reset date/time if provider changes
  useEffect(() => {
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    setAppointmentNotes(""); // Reset notes too
  }, [selectedProviderId]);

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleConfirmBooking = async () => {
    // TODO: Implement actual booking submission logic here
    // This will involve calling a server action or API endpoint
    console.log("Booking Confirmed (Mock):");
    console.log({ 
      clinicId: selectedClinicId,
      serviceId: selectedServiceId,
      providerId: selectedProviderId,
      date: selectedDate?.toISOString().split('T')[0], // Format as YYYY-MM-DD
      timeSlot: selectedTimeSlot, // This would be the actual time or slot ID
      notes: appointmentNotes
    });
    // Example: Show a success toast (if using Shadcn toaster)
    // toast({ title: "Booking Submitted!", description: "Your appointment has been requested." });
    // Potentially redirect or show a success message component
  };

  // Determine if next button should be disabled
  let isNextDisabled = false;
  if (currentStep === 0) {
    isNextDisabled = !selectedClinicId || !selectedServiceId;
  } else if (currentStep === 1) {
    isNextDisabled = !selectedProviderId;
  } else if (currentStep === 2) {
    isNextDisabled = !selectedDate || !selectedTimeSlot;
  } else if (currentStep === steps.length - 1) {
    // No specific disable logic for confirmation step, button is "Confirm Booking"
    // But could add validation here if notes were mandatory, for example.
  }

  const stepProps: StepProps = {
    selectedClinicId,
    setSelectedClinicId,
    selectedServiceId,
    setSelectedServiceId,
    selectedProviderId, 
    setSelectedProviderId,
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    appointmentNotes,
    setAppointmentNotes,
  };

  return (
    <div>
      <BookingProgressIndicator steps={steps.map(s => ({id: s.id, name: s.name}))} currentStepIndex={currentStep} />

      <div className="p-8 my-4 border border-input rounded-lg bg-card text-card-foreground shadow-sm">
        {CurrentStepComponent ? (
          <CurrentStepComponent {...stepProps} />
        ) : (
          <div className="p-8 my-4 border border-dashed rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{steps[currentStep].name}</h2>
            <p>Content for {steps[currentStep].name} will go here.</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <Button onClick={handlePrevious} disabled={currentStep === 0} variant="outline">
          Previous
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button 
            onClick={handleNext} 
            disabled={isNextDisabled}
          >
            Next
          </Button>
        ) : (
          <Button 
            onClick={handleConfirmBooking} 
            disabled={isNextDisabled}
          >
            Confirm Booking
          </Button>
        )}
      </div>
    </div>
  );
} 