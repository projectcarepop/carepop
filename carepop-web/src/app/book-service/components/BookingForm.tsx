'use client';

import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Import useRouter
import { Button } from '@/components/ui/button';
import ClinicServiceSelectionStep from './ClinicServiceSelectionStep'; // Import the step component
import ProviderSelectionStep from './ProviderSelectionStep'; // Removed ProviderSelectionStepProps import
import DateTimeSelectionStep from './DateTimeSelectionStep'; // Removed DateTimeSelectionStepProps import
import ConfirmationStep from './ConfirmationStep'; // Removed ConfirmationStepProps import
import BookingProgressIndicator from './BookingProgressIndicator'; // Import the new indicator
import { createAppointmentAction } from '@/lib/actions/appointments'; // Import the server action
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For feedback
import { Terminal } from 'lucide-react'; // For alert icon

// Base props common to most steps
interface BaseStepProps {
  selectedClinicId: string | null;
  setSelectedClinicId: Dispatch<SetStateAction<string | null>>;
  selectedClinicName: string | null; // Added for display in confirmation
  setSelectedClinicName: Dispatch<SetStateAction<string | null>>; // Added
  selectedServiceId: string | null;
  setSelectedServiceId: Dispatch<SetStateAction<string | null>>;
  selectedProviderId: string | null;
  setSelectedProviderId: Dispatch<SetStateAction<string | null>>;
  selectedProviderName: string | null; // Added for display
  setSelectedProviderName: Dispatch<SetStateAction<string | null>>; // Added
  selectedProviderSpecialty: string | null; // Added
  setSelectedProviderSpecialty: Dispatch<SetStateAction<string | null>>; // Added
  selectedProviderAvatarUrl: string | null; // Added
  setSelectedProviderAvatarUrl: Dispatch<SetStateAction<string | null>>; // Added
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

interface ServiceDetails {
  id: string;
  name: string;
  price?: number | null;
  duration?: string | null;
  requiresProviderAssignment: boolean;
  // Potentially add categoryName here if needed later
}

export default function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter(); // For redirecting after successful booking
  const [currentStep, setCurrentStep] = useState(0);

  // State for selected clinic and service
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [selectedClinicName, setSelectedClinicName] = useState<string | null>(null); // New state for clinic name
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null); // State for provider
  const [selectedProviderName, setSelectedProviderName] = useState<string | null>(null); // New state for provider name
  const [selectedProviderSpecialty, setSelectedProviderSpecialty] = useState<string | null>(null); // New state
  const [selectedProviderAvatarUrl, setSelectedProviderAvatarUrl] = useState<string | null>(null); // New state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined); // State for date
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null); // State for time slot
  const [appointmentNotes, setAppointmentNotes] = useState<string>(""); // State for notes
  
  // Add state for selected service details needed by ProviderSelectionStep
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<ServiceDetails | null>(null);

  // State for API call feedback
  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
    setSelectedProviderName(null);
    setSelectedProviderSpecialty(null); // Reset
    setSelectedProviderAvatarUrl(null); // Reset
    setSelectedClinicName(null); // Reset clinic name
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    setAppointmentNotes("");
    setSelectedServiceDetails(null); // Reset service details
    setFormMessage(null); // Clear any previous messages
  }, [searchParams]); // Simpler dependency array for initial load

  // Effect to reset subsequent selections when clinic or service changes
  useEffect(() => {
      setSelectedProviderId(null);
      setSelectedProviderName(null);
      setSelectedProviderSpecialty(null); // Reset
      setSelectedProviderAvatarUrl(null); // Reset
      setSelectedDate(undefined);
      setSelectedTimeSlot(null);
      // setAppointmentNotes(""); // Notes could persist if desired
      setSelectedServiceDetails(null); // Reset service details if clinic/service changes
      setFormMessage(null); // Clear messages on step change
  }, [selectedClinicId, selectedServiceId]);

  // Effect to reset date/time if provider changes
  useEffect(() => {
    setSelectedDate(undefined);
    setSelectedTimeSlot(null);
    setFormMessage(null); // Clear messages on step change
  }, [selectedProviderId]);

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = (data?: any) => { // Allow data to be passed from steps
    setFormMessage(null); // Clear messages on step change
    if (steps[currentStep].id === 'clinicServiceSelection' && data) {
        // Data from ClinicServiceSelectionStep includes: 
        // clinicId, serviceId, clinicName, serviceName, price, duration, requiresProviderAssignment
        setSelectedClinicId(data.clinicId); // Ensure clinicId is also set from this step if it can change here
        setSelectedClinicName(data.clinicName);
        setSelectedServiceId(data.serviceId); // Ensure serviceId is also set from this step
        setSelectedServiceDetails({
            id: data.serviceId,
            name: data.serviceName,
            price: data.price,
            duration: data.duration,
            requiresProviderAssignment: data.requiresProviderAssignment,
        });
        // Reset provider since clinic/service changed
        setSelectedProviderId(null);
        setSelectedProviderName(null);
        setSelectedProviderSpecialty(null);
        setSelectedProviderAvatarUrl(null);
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setFormMessage(null); // Clear messages on step change
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleConfirmBooking = async () => {
    if (!selectedClinicId || !selectedServiceId || !selectedDate || !selectedTimeSlot) {
      setFormMessage({ type: 'error', message: 'Missing required booking information. Please review your selections.' });
      return;
    }

    // Basic validation for provider if service requires it
    if (selectedServiceDetails?.requiresProviderAssignment && !selectedProviderId) {
        setFormMessage({ type: 'error', message: 'This service requires a provider to be selected.' });
        // Optionally, send user back to provider selection step
        // const providerStepIndex = steps.findIndex(s => s.id === 'providerSelection');
        // if (providerStepIndex !== -1) setCurrentStep(providerStepIndex);
        return;
    }

    setIsLoading(true);
    setFormMessage(null);

    const appointmentDateStr = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const appointmentTimeStr = selectedTimeSlot; // Assuming this is HH:MM or HH:MM:SS

    const result = await createAppointmentAction({
      clinicId: selectedClinicId,
      serviceId: selectedServiceId,
      providerId: selectedProviderId, // Pass null if not selected and service allows
      appointmentDate: appointmentDateStr,
      appointmentTime: appointmentTimeStr,
      notes: appointmentNotes,
    });

    setIsLoading(false);

    if (result.success && result.data) {
      setFormMessage({ type: 'success', message: 'Booking confirmed successfully! Redirecting to your appointments...' });
      // TODO: Potentially pass booking ID or details to the appointments page
      // For now, just redirecting to a generic appointments page
      setTimeout(() => router.push('/dashboard/appointments'), 3000); // Redirect after a delay
    } else {
      setFormMessage({ type: 'error', message: result.message || 'Failed to confirm booking. Please try again.' });
    }
  };

  let isNextDisabled = false;
  if (steps[currentStep].id === 'clinicServiceSelection') {
    isNextDisabled = !selectedClinicId || !selectedServiceId; // This step's button is internal, but good for consistency
  } else if (steps[currentStep].id === 'providerSelection') {
    isNextDisabled = selectedServiceDetails?.requiresProviderAssignment ? !selectedProviderId : false;
  } else if (steps[currentStep].id === 'dateTimeSelection') {
    isNextDisabled = !selectedDate || !selectedTimeSlot;
  }

  const baseProps: Omit<BaseStepProps, 'selectedServiceDetails'> = { // Omit selectedServiceDetails as it's internal
    selectedClinicId,
    setSelectedClinicId,
    selectedClinicName,
    setSelectedClinicName,
    selectedServiceId,
    setSelectedServiceId,
    selectedProviderId,
    setSelectedProviderId,
    selectedProviderName,
    setSelectedProviderName,
    selectedProviderSpecialty,
    setSelectedProviderSpecialty,
    selectedProviderAvatarUrl,
    setSelectedProviderAvatarUrl,
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    appointmentNotes,
    setAppointmentNotes,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stepSpecificProps: any = { ...baseProps }; // Base props are passed to all steps

  if (steps[currentStep].id === 'clinicServiceSelection') {
    stepSpecificProps.onNext = handleNext; 
    // setSelectedClinicId, setSelectedServiceId are passed via baseProps if needed for initial state, 
    // but this step calls onNext with all details including IDs.
  } else if (steps[currentStep].id === 'providerSelection') {
    stepSpecificProps.selectedService = selectedServiceDetails; 
    stepSpecificProps.onBack = handlePrevious;
    stepSpecificProps.setSelectedProviderIdProp = (id: string | null, name?: string | null, specialty?: string | null, avatarUrl?: string | null) => {
        setSelectedProviderId(id);
        setSelectedProviderName(name || null); 
        setSelectedProviderSpecialty(specialty || null); 
        setSelectedProviderAvatarUrl(avatarUrl || null); 
    };
  } else if (steps[currentStep].id === 'dateTimeSelection') {
    stepSpecificProps.onBack = handlePrevious;
    stepSpecificProps.selectedClinicId = selectedClinicId; 
    stepSpecificProps.selectedServiceId = selectedServiceId; 
    stepSpecificProps.serviceRequiresProvider = selectedServiceDetails?.requiresProviderAssignment ?? false; 
    // selectedProviderId is already in baseProps
  } else if (steps[currentStep].id === 'confirmation'){
    stepSpecificProps.bookingDetails = {
        clinicId: selectedClinicId,
        clinicName: selectedClinicName, // Added
        serviceId: selectedServiceId, 
        serviceName: selectedServiceDetails?.name, // From selectedServiceDetails
        providerId: selectedProviderId,
        providerName: selectedProviderName, // Added
        providerSpecialty: selectedProviderSpecialty, // Added
        providerAvatarUrl: selectedProviderAvatarUrl, // Added
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        notes: appointmentNotes,
        serviceDetails: selectedServiceDetails, // Pass the whole object for price, duration etc.
    };
    stepSpecificProps.onConfirm = handleConfirmBooking; 
    stepSpecificProps.onEdit = (stepId: string) => {
        setFormMessage(null); 
        const stepIndex = steps.findIndex(s => s.id === stepId);
        if (stepIndex !== -1) setCurrentStep(stepIndex);
    };
  }

  return (
    <div>
      <BookingProgressIndicator steps={steps.map(s => ({ id: s.id, name: s.name }))} currentStepIndex={currentStep} />

      {/* Form-level Messages */} 
      {formMessage && (
        <Alert 
            variant={formMessage.type === 'error' ? 'destructive' : 'default'} 
            className={`my-4 ${formMessage.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : ''}`}>
          <Terminal className="h-4 w-4" />
          <AlertTitle>{formMessage.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          <AlertDescription>
            {formMessage.message}
          </AlertDescription>
        </Alert>
      )}

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
          <Button onClick={handlePrevious} disabled={currentStep === 0 || isLoading} variant="outline">
            Previous
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={() => handleNext()} // Call handleNext without args for these generic buttons
              disabled={isNextDisabled || isLoading}
            >
              {isLoading && currentStep === steps.length - 2 ? 'Processing...' : 'Next'} {/* Penultimate step's Next leads to Confirmation */}
            </Button>
          ) : (
            // The main "Confirm Booking" button is usually here, unless it's inside ConfirmationStep itself
            <Button
              onClick={handleConfirmBooking}
              disabled={isNextDisabled || isLoading} // Or specific validation for confirmation
            >
              {isLoading ? 'Confirming Booking...' : 'Confirm Booking'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 