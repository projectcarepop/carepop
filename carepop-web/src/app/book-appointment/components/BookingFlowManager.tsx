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
import { Check, Edit2, Home, Stethoscope, User, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

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

  const renderConsolidatedSummary = () => {
    if (!bookingData.clinic) {
      return null;
    }

    const clinicStepIndex = stepsOrder.indexOf(STEPS.SELECT_CLINIC);
    const serviceStepIndex = stepsOrder.indexOf(STEPS.SELECT_SERVICE_AND_DOCTOR);
    const dateStepIndex = stepsOrder.indexOf(STEPS.SELECT_DATE_TIME);
    const currentStepIndex = stepsOrder.indexOf(currentStep);

    return (
        <Card className="mb-8 bg-muted/40">
            <CardHeader>
                <CardTitle>Your Booking Summary</CardTitle>
                <CardDescription>Review your selections below.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
                {/* --- Clinic --- */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Home className="w-5 h-5 text-muted-foreground" />
                        <span className="font-semibold">{bookingData.clinic.name}</span>
                    </div>
                    {currentStepIndex > clinicStepIndex && (
                        <Button variant="outline" size="sm" onClick={() => goToStep(STEPS.SELECT_CLINIC)}>
                            <Edit2 className="w-3 h-3 mr-1.5" /> Change
                        </Button>
                    )}
                </div>

                {/* --- Service --- */}
                {bookingData.service && (
                     <div className="border-t pt-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Stethoscope className="w-5 h-5 text-muted-foreground" />
                            <div>
                                <span className="font-semibold">{bookingData.service.name} </span>
                                <span className="text-xs text-muted-foreground">({bookingData.service.durationMinutes} min)</span>
                            </div>
                        </div>
                        {currentStepIndex > serviceStepIndex && (
                            <Button variant="outline" size="sm" onClick={() => goToStep(STEPS.SELECT_SERVICE_AND_DOCTOR)}>
                                <Edit2 className="w-3 h-3 mr-1.5" /> Change
                            </Button>
                        )}
                    </div>
                )}
                
                {/* --- Doctor --- */}
                {bookingData.doctor && (
                    <div className="border-t pt-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-muted-foreground" />
                            <span className="font-semibold">{bookingData.doctor.fullName}</span>
                        </div>
                        {/* The change button for the doctor is the same as for the service */}
                        {currentStepIndex > serviceStepIndex && (
                            <Button variant="outline" size="sm" onClick={() => goToStep(STEPS.SELECT_SERVICE_AND_DOCTOR)}>
                                <Edit2 className="w-3 h-3 mr-1.5" /> Change
                            </Button>
                        )}
                    </div>
                )}
                
                {/* --- Date & Time --- */}
                {bookingData.slot && (
                    <div className="border-t pt-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <CalendarDays className="w-5 h-5 text-muted-foreground" />
                            <span className="font-semibold">{format(bookingData.slot, "EEE, MMMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                        {currentStepIndex > dateStepIndex && (
                             <Button variant="outline" size="sm" onClick={() => goToStep(STEPS.SELECT_DATE_TIME)}>
                                <Edit2 className="w-3 h-3 mr-1.5" /> Change
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
  }

  const currentStepIndex = stepsOrder.indexOf(currentStep);

  const renderCurrentStepContent = () => {
    return (
      <div className="relative">
        {/* --- Step Content --- */}
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderStepContent(currentStep)}
                </motion.div>
            </AnimatePresence>
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
  };

  return (
    <div className="container mx-auto px-4 py-8 relative max-w-4xl">
       {currentStep !== STEPS.SELECT_CLINIC && (
           <Button variant="link" className="absolute top-0 right-0" onClick={resetFlow}>
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
      
      {/* Main Content Area */}
      <div className="mb-12">
        {renderCurrentStepContent()}
      </div>

      {/* Summary Section - now at the bottom */}
      {renderConsolidatedSummary()}

    </div>
  );
} 