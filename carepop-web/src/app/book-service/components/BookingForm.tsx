'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { Button } from '@/components/ui/button';
import ClinicServiceSelectionStep from './ClinicServiceSelectionStep'; // Import the step component
import ProviderSelectionStep, { ProviderSelectionStepProps } from './ProviderSelectionStep'; // Import the new step component and its props type
import DateTimeSelectionStep, { DateTimeSelectionStepProps } from './DateTimeSelectionStep'; // Import the new step component and its props type
import ConfirmationStep, { ConfirmationStepProps } from './ConfirmationStep'; // Import the new step component and its props type
import BookingProgressIndicator from './BookingProgressIndicator'; // Import the new indicator

// Base props common to most steps
interface BaseStepProps {
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

// Define specific props for each step component that might include callbacks
// ClinicServiceSelectionStepProps is defined in its own file and includes its specific onNext

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
  
  // Add state for selected service details needed by ProviderSelectionStep
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<{
    id: string;
    name: string;
    price?: number | null;
    duration?: string | null;
    requiresProviderAssignment: boolean;
  } | null>(null);

  useEffect(() => {
    const clinicIdFromUrl = searchParams.get('clinicId');
    const serviceIdFromUrl = searchParams.get('serviceId');
    if (clinicIdFromUrl) {
      setSelectedClinicId(clinicIdFromUrl);
    }
    if (serviceIdFromUrl) {
      // If serviceId comes from URL, we might need to fetch its details here
      // For now, assume ClinicServiceSelectionStep will update selectedServiceDetails via its onNext
      setSelectedServiceId(serviceIdFromUrl);
    }
    setSelectedProviderId(null);
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    setAppointmentNotes("");
    setSelectedServiceDetails(null); // Reset service details
  }, [searchParams]); // Simpler dependency array for initial load

  // Effect to reset subsequent selections when clinic or service changes
  useEffect(() => {
      setSelectedProviderId(null);
      setSelectedDate(undefined);
      setSelectedTimeSlot(null);
      // setAppointmentNotes(""); // Notes could persist if desired
      setSelectedServiceDetails(null); // Reset service details if clinic/service changes
  }, [selectedClinicId, selectedServiceId]);

  // Effect to reset date/time if provider changes
  useEffect(() => {
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
  }, [selectedProviderId]);

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = (data?: any) => { // Allow data to be passed from steps
    if (steps[currentStep].id === 'clinicServiceSelection' && data) {
        setSelectedServiceDetails({
            id: data.serviceId,
            name: data.serviceName,
            price: data.price,
            duration: data.duration,
            requiresProviderAssignment: data.requiresProviderAssignment,
        });
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleConfirmBooking = async () => {
    console.log("Booking Confirmed (Mock):");
    console.log({
      clinicId: selectedClinicId,
      serviceId: selectedServiceId,
      providerId: selectedProviderId,
      date: selectedDate?.toISOString().split('T')[0],
      timeSlot: selectedTimeSlot,
      notes: appointmentNotes,
      serviceDetails: selectedServiceDetails // Log selected service details
    });
  };

  let isNextDisabled = false;
  if (steps[currentStep].id === 'clinicServiceSelection') {
    isNextDisabled = !selectedClinicId || !selectedServiceId; // This step's button is internal, but good for consistency
  } else if (steps[currentStep].id === 'providerSelection') {
    isNextDisabled = !selectedProviderId;
  } else if (steps[currentStep].id === 'dateTimeSelection') {
    isNextDisabled = !selectedDate || !selectedTimeSlot;
  }

  const baseProps: BaseStepProps = {
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

  let stepSpecificProps: any = { ...baseProps };

  if (steps[currentStep].id === 'clinicServiceSelection') {
    stepSpecificProps.onNext = handleNext; // ClinicServiceSelectionStep will call this with data
  } else if (steps[currentStep].id === 'providerSelection') {
    stepSpecificProps.selectedService = selectedServiceDetails; // Pass the stored service details
    stepSpecificProps.onNext = handleNext;
    stepSpecificProps.onBack = handlePrevious;
  } else if (steps[currentStep].id === 'dateTimeSelection') {
    stepSpecificProps.onNext = handleNext;
    stepSpecificProps.onBack = handlePrevious;
    // Pass any other specific props dateTimeSelection might need, like provider details if relevant for availability
  } else if (steps[currentStep].id === 'confirmation'){
    // Confirmation step might need all accumulated data
    stepSpecificProps.bookingDetails = {
        clinicId: selectedClinicId,
        serviceId: selectedServiceId, 
        providerId: selectedProviderId,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        notes: appointmentNotes,
        serviceDetails: selectedServiceDetails,
        // Potentially clinicName, providerName if fetched and stored
    };
    stepSpecificProps.onConfirm = handleConfirmBooking; // If confirm button is in the step
    stepSpecificProps.onEdit = (stepId: string) => {
        const stepIndex = steps.findIndex(s => s.id === stepId);
        if (stepIndex !== -1) setCurrentStep(stepIndex);
    };
  }

  return (
    <div>
      <BookingProgressIndicator steps={steps.map(s => ({ id: s.id, name: s.name }))} currentStepIndex={currentStep} />

      <div className="p-0 my-4"> {/* Wrapper for the step component card */}
        {CurrentStepComponent ? (
          <CurrentStepComponent {...stepSpecificProps} />
        ) : (
          <div className="p-8 my-4 border border-dashed rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{steps[currentStep]?.name || 'Step'}</h2>
            <p>Content for {steps[currentStep]?.name || 'this step'} will go here.</p>
          </div>
        )}
      </div>

      {/* Main navigation buttons, hidden for the first step (ClinicServiceSelection) */}
      {steps[currentStep].id !== 'clinicServiceSelection' && (
        <div className="mt-6 flex justify-between">
          <Button onClick={handlePrevious} disabled={currentStep === 0} variant="outline">
            Previous
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => handleNext()} // Call handleNext without args for these generic buttons
              disabled={isNextDisabled}
            >
              Next
            </Button>
          ) : (
            // The main "Confirm Booking" button is usually here, unless it's inside ConfirmationStep itself
            <Button
              onClick={handleConfirmBooking}
              disabled={isNextDisabled} // Or specific validation for confirmation
            >
              Confirm Booking
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 