'use client';

import React, { useState, useMemo } from 'react';
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
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ProgressStepper } from "./ProgressStepper";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

// This will hold all the data collected during the booking process
export interface BookingData {
  clinic?: Clinic;
  service?: Service;
  doctor?: Doctor;
  slot?: Date;
}

const steps = [
    { id: 'Step 1', name: 'Select Clinic' },
    { id: 'Step 2', name: 'Select Service & Doctor' },
    { id: 'Step 3', name: 'Select Date & Time' },
    { id: 'Step 4', name: 'Confirm Details' },
];

export function BookingFlowManager() {
  const [currentStep, setCurrentStep] = useState(0); // Use index for simplicity
  const [bookingData, setBookingData] = useState<BookingData>({});

  const resetFlow = () => {
    setBookingData({});
    setCurrentStep(0);
  }

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      // When going back, clear the state of the steps ahead
      if (currentStep === 3) { // From Confirmation to DateTime
        updateBookingData({ slot: undefined });
      } else if (currentStep === 2) { // From DateTime to Service/Doctor
        updateBookingData({ doctor: undefined, slot: undefined });
      } else if (currentStep === 1) { // From Service/Doctor to Clinic
        updateBookingData({ service: undefined, doctor: undefined, slot: undefined });
      }
      setCurrentStep(prev => prev - 1);
    }
  };

  const isStepComplete = useMemo(() => {
    switch (currentStep) {
      case 0:
        return !!bookingData.clinic;
      case 1:
        return !!bookingData.service && !!bookingData.doctor;
      case 2:
        return !!bookingData.slot;
      case 3:
        return true;
      default:
        return false;
    }
  }, [currentStep, bookingData]);


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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1_ClinicSelection 
          updateBookingData={updateBookingData} 
          goToNextStep={goToNextStep} 
        />;
      case 1:
        return <Step2_ServiceAndDoctorSelection 
          bookingData={bookingData}
          updateBookingData={updateBookingData}
          goToNextStep={goToNextStep}
        />;
      case 2:
        return <Step3_DateTimeSelection
          bookingData={bookingData}
          updateBookingData={updateBookingData}
          goToNextStep={goToNextStep}
        />;
      case 3:
        return <Step4_Confirmation
          bookingData={bookingData}
          confirmBooking={confirmBooking}
          isBooking={bookingMutation.isPending}
        />;
      default:
        return <div>Invalid Step</div>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
            <ProgressStepper steps={steps} currentStep={currentStep} />
        </CardHeader>
        <CardContent className="min-h-[400px]">
            {renderCurrentStep()}
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={resetFlow}>
                    Start Over
                </Button>
                {currentStep < steps.length - 1 && (
                    <Button onClick={goToNextStep} disabled={!isStepComplete}>
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
                {currentStep === steps.length - 1 && (
                    <Button onClick={confirmBooking} disabled={bookingMutation.isPending}>
                        {bookingMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Booking
                    </Button>
                )}
            </div>
        </CardFooter>
    </Card>
  );
} 