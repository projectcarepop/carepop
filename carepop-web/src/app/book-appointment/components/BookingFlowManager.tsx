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

// The steps of our new booking flow
const STEPS = {
  SELECT_CLINIC: 'SELECT_CLINIC',
  SELECT_SERVICE_AND_DOCTOR: 'SELECT_SERVICE_AND_DOCTOR',
  SELECT_DATE_TIME: 'SELECT_DATE_TIME',
  CONFIRMATION: 'CONFIRMATION',
};

// This will hold all the data collected during the booking process
export interface BookingData {
  clinicId?: string;
  serviceId?: string;
  doctorId?: string;
  slot?: Date;
}

const stepsOrder = [
    STEPS.SELECT_CLINIC,
    STEPS.SELECT_SERVICE_AND_DOCTOR,
    STEPS.SELECT_DATE_TIME,
    STEPS.CONFIRMATION,
];

export function BookingFlowManager() {
  const [currentStep, setCurrentStep] = useState(STEPS.SELECT_CLINIC);
  const [bookingData, setBookingData] = useState<BookingData>({
    clinicId: undefined,
    serviceId: undefined,
    doctorId: undefined,
    slot: undefined,
  });

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const goToNextStep = () => {
    const currentIndex = stepsOrder.indexOf(currentStep);
    if (currentIndex < stepsOrder.length - 1) {
      setCurrentStep(stepsOrder[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = stepsOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepsOrder[currentIndex - 1]);
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
    if (!bookingData.clinicId || !bookingData.serviceId || !bookingData.doctorId || !bookingData.slot) {
        toast({ title: "Error", description: "Incomplete booking details.", variant: "destructive" });
        return;
    }

    bookingMutation.mutate({
        clinic_id: bookingData.clinicId,
        service_id: bookingData.serviceId,
        doctor_id: bookingData.doctorId,
        appointment_time: bookingData.slot.toISOString(),
    });
  };

  const renderCurrentStep = () => {
    if (currentStep === STEPS.SELECT_CLINIC) {
      return <Step1_ClinicSelection 
        updateBookingData={updateBookingData} 
        goToNextStep={goToNextStep} 
      />;
    }
    if (currentStep === STEPS.SELECT_SERVICE_AND_DOCTOR) {
      return <Step2_ServiceAndDoctorSelection 
        bookingData={bookingData}
        updateBookingData={updateBookingData}
        goToNextStep={goToNextStep}
        goToPreviousStep={goToPreviousStep}
      />;
    }
    if (currentStep === STEPS.SELECT_DATE_TIME) {
      return <Step3_DateTimeSelection
        bookingData={bookingData}
        updateBookingData={updateBookingData}
        goToNextStep={goToNextStep}
        goToPreviousStep={goToPreviousStep}
      />;
    }
    if (currentStep === STEPS.CONFIRMATION) {
      return <Step4_Confirmation
        bookingData={bookingData}
        goToPreviousStep={goToPreviousStep}
        confirmBooking={confirmBooking}
        isBooking={bookingMutation.isPending}
      />;
    }
    return <div>Invalid Step</div>;
  };

  return (
    <div>
      {/* We can add a progress bar here later */}
      <div className="mt-8">
        {renderCurrentStep()}
      </div>
    </div>
  );
} 