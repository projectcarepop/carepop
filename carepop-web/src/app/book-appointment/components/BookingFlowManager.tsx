'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Step1_ClinicSelection } from './Step1_ClinicSelection';
import { Step2_ServiceAndDoctorSelection } from './Step2_ServiceAndDoctorSelection';
import { Step3_DateTimeSelection } from './Step3_DateTimeSelection';
import { Step4_Confirmation } from './Step4_Confirmation';
import { createAppointment } from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { type Clinic, type Service, type Doctor } from '@/lib/types/bookings';
import { Button } from '@/components/ui/button';
import { Check, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// The steps of our new booking flow
const STEPS = {
  SELECT_CLINIC: 'SELECT_CLINIC',
  SELECT_SERVICE_AND_DOCTOR: 'SELECT_SERVICE_AND_DOCTOR',
  SELECT_DATE_TIME: 'SELECT_DATE_TIME',
  CONFIRMATION: 'CONFIRMATION',
};

// This will hold all the data collected during the booking process
export interface BookingData {
  clinic?: Clinic;
  service?: Service;
  doctor?: Doctor;
  slot?: Date;
}

const stepsOrder = [
    STEPS.SELECT_CLINIC,
    STEPS.SELECT_SERVICE_AND_DOCTOR,
    STEPS.SELECT_DATE_TIME,
    STEPS.CONFIRMATION,
];

const stepLabels: { [key: string]: string } = {
    [STEPS.SELECT_CLINIC]: 'Clinic',
    [STEPS.SELECT_SERVICE_AND_DOCTOR]: 'Service & Doctor',
    [STEPS.SELECT_DATE_TIME]: 'Date & Time',
    [STEPS.CONFIRMATION]: 'Confirm',
};

export function BookingFlowManager() {
  const [currentStep, setCurrentStep] = useState(STEPS.SELECT_CLINIC);
  const [isSelectionMade, setSelectionMade] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData>({
    clinic: undefined,
    service: undefined,
    doctor: undefined,
    slot: undefined,
  });

  const resetFlow = () => {
    setBookingData({
        clinic: undefined,
        service: undefined,
        doctor: undefined,
        slot: undefined,
    });
    setCurrentStep(STEPS.SELECT_CLINIC);
  }

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const goToStep = (step: string) => {
    const stepIndex = stepsOrder.indexOf(step);
    const currentIndex = stepsOrder.indexOf(currentStep);

    if (stepIndex < currentIndex) {
      // FIX: When jumping back, clear the state of all subsequent steps
      // to prevent data inconsistencies.
      const dataToClear: Partial<BookingData> = {};
      if (step === STEPS.SELECT_CLINIC) {
        dataToClear.service = undefined;
        dataToClear.doctor = undefined;
        dataToClear.slot = undefined;
      } else if (step === STEPS.SELECT_SERVICE_AND_DOCTOR) {
        dataToClear.doctor = undefined;
        dataToClear.slot = undefined;
      }
      updateBookingData(dataToClear);

      setCurrentStep(step);
      setSelectionMade(true);
    }
  }

  const goToNextStep = () => {
    const currentIndex = stepsOrder.indexOf(currentStep);
    if (currentIndex < stepsOrder.length - 1) {
      setCurrentStep(stepsOrder[currentIndex + 1]);
      setSelectionMade(false); // Reset for next step
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = stepsOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      // When going back, clear the state of the steps ahead
      if (currentStep === STEPS.CONFIRMATION) {
        updateBookingData({ slot: undefined });
      } else if (currentStep === STEPS.SELECT_DATE_TIME) {
        updateBookingData({ doctor: undefined, slot: undefined });
      } else if (currentStep === STEPS.SELECT_SERVICE_AND_DOCTOR) {
        updateBookingData({ service: undefined, doctor: undefined, slot: undefined });
      }

      setCurrentStep(stepsOrder[currentIndex - 1]);
      setSelectionMade(true); // Selections in previous steps are already made
    }
  };

  const { session } = useAuth();
  const accessToken = session?.access_token;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  const bookingMutation = useMutation({
    mutationFn: (payload: { clinic_id: string; service_id: string; doctor_id: string; appointment_time: string; }) => {
        if (!accessToken) throw new Error("Not authorized");
        return createAppointment(payload, accessToken);
    },
    onSuccess: () => {
        toast({
            title: "Booking Confirmed!",
            description: "Your appointment has been successfully scheduled.",
        });
        queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
        router.push('/main-dashboard'); // Redirect to dashboard after booking
    },
    onError: (error) => {
        toast({
            title: "Booking Failed",
            description: error.message,
            variant: "destructive",
        });
    }
  });

  const confirmBooking = () => {
    if (!bookingData.clinic || !bookingData.service || !bookingData.doctor || !bookingData.slot) {
        toast({ title: "Error", description: "Incomplete booking details.", variant: "destructive" });
        return;
    }

    bookingMutation.mutate({
        clinic_id: bookingData.clinic.id,
        service_id: bookingData.service.id,
        doctor_id: bookingData.doctor.id,
        appointment_time: bookingData.slot.toISOString(),
    });
  };

  const renderStepContent = (step: string) => {
    if (step === STEPS.SELECT_CLINIC) {
      return <Step1_ClinicSelection 
        updateBookingData={updateBookingData}
        setSelectionMade={setSelectionMade}
        bookingData={bookingData}
      />;
    }
    if (step === STEPS.SELECT_SERVICE_AND_DOCTOR) {
      return <Step2_ServiceAndDoctorSelection 
        bookingData={bookingData}
        updateBookingData={updateBookingData}
        setSelectionMade={setSelectionMade}
      />;
    }
    if (step === STEPS.SELECT_DATE_TIME) {
      return <Step3_DateTimeSelection
        bookingData={bookingData}
        updateBookingData={updateBookingData}
        setSelectionMade={setSelectionMade}
      />;
    }
    if (step === STEPS.CONFIRMATION) {
      return <Step4_Confirmation
        bookingData={bookingData}
        confirmBooking={confirmBooking}
        isBooking={bookingMutation.isPending}
      />;
    }
    return <div>Invalid Step</div>;
  };

  const renderStepSummary = (step: string) => {
    let summaryText = '';
    if (step === STEPS.SELECT_CLINIC && bookingData.clinic) {
      summaryText = `Clinic: ${bookingData.clinic.name}`;
    } else if (step === STEPS.SELECT_SERVICE_AND_DOCTOR && bookingData.service && bookingData.doctor) {
      summaryText = `Service & Doctor: ${bookingData.service.name} with ${bookingData.doctor.fullName}`;
    } else if (step === STEPS.SELECT_DATE_TIME && bookingData.slot) {
      summaryText = `Date & Time: ${format(bookingData.slot, "MMMM d, yyyy 'at' h:mm a")}`;
    } else {
      return null;
    }

    return (
      <AnimatePresence>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-4 flex justify-between items-center">
            <div className="flex items-center">
              <Check className="w-5 h-5 mr-3 text-green-500" />
              <p className="font-semibold">{summaryText}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => goToStep(step)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Change
            </Button>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  }

  const currentStepIndex = stepsOrder.indexOf(currentStep);

  return (
    <div className="relative">
      {currentStep !== STEPS.SELECT_CLINIC && (
          <Button variant="link" className="absolute top-0 right-0 -mt-4" onClick={resetFlow}>
              Start Over
          </Button>
      )}
      
      {/* --- Visual Progress Stepper --- */}
      <div className="flex items-start mb-12">
        {stepsOrder.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300",
                    isCompleted ? "bg-primary text-primary-foreground" :
                    isCurrent ? "bg-primary/20 border-2 border-primary text-primary" :
                    "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : index + 1}
                </div>
                <p className={cn(
                  "mt-2 text-sm text-center w-24 transition-all duration-300 hidden sm:block", 
                  isCurrent ? "font-bold text-primary" : "text-muted-foreground"
                )}>
                  {stepLabels[step]}
                </p>
              </div>
              {index < stepsOrder.length - 1 && (
                <div className={cn("flex-1 h-1 mt-5 mx-4", isCompleted ? "bg-primary" : "bg-muted")} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="space-y-4">
        {stepsOrder.map((step, index) => {
          if (index < currentStepIndex) {
            // Render summary for completed steps
            return <div key={step}>{renderStepSummary(step)}</div>;
          } else if (index === currentStepIndex) {
            // Render the active step component
            return (
              <div key={step}>
                {renderStepContent(step)}
              </div>
            );
          }
          // Do not render future steps
          return null;
        })}
      </div>

      {/* --- Centralized Navigation Footer --- */}
      {currentStep !== STEPS.CONFIRMATION && (
        <div className="mt-8 pt-4 border-t flex justify-between items-center">
          <div>
            {currentStepIndex > 0 && (
              <Button variant="outline" onClick={goToPreviousStep}>
                Back
              </Button>
            )}
          </div>
          <Button onClick={goToNextStep} disabled={!isSelectionMade}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
} 