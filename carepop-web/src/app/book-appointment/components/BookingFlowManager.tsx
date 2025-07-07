'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Step1_ClinicSelection } from './Step1_ClinicSelection';
import { Step2_ServiceAndDoctorSelection } from './Step2_ServiceAndDoctorSelection';
import { Step3_DateTimeSelection } from './Step3_DateTimeSelection';
import { Step4_Confirmation } from './Step4_Confirmation';
import { useToast } from '@/hooks/use-toast';
import { createAppointment } from '@/services/api';

import type { Clinic, Service, Doctor } from '@/lib/types';
import { Stepper } from './Stepper';

// The steps of our new booking flow
const STEPS = {
  SELECT_CLINIC: 'SELECT_CLINIC',
  SELECT_SERVICE_AND_DOCTOR: 'SELECT_SERVICE_AND_DOCTOR',
  SELECT_DATE_TIME: 'SELECT_DATE_TIME',
  CONFIRMATION: 'CONFIRMATION',
};

// This will hold all the data collected during the booking process
export interface BookingData {
  clinic: Clinic | null;
  service: Service | null;
  doctor: Doctor | null;
  dateTime: Date | null;
}

const stepsConfig = [
    { id: 'clinic', label: 'Clinic', step: 1 },
    { id: 'service', label: 'Service & Doctor', step: 2 },
    { id: 'datetime', label: 'Date & Time', step: 3 },
    { id: 'confirm', label: 'Confirm', step: 4 },
];

export function BookingFlowManager() {
    const { toast } = useToast();
    const router = useRouter();

    const [bookingData, setBookingData] = useState<BookingData>({
        clinic: null,
        service: null,
        doctor: null,
        dateTime: null,
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateBookingData = (data: Partial<BookingData>) => {
        setBookingData(prev => ({ ...prev, ...data }));
    };

    const currentStepId = useMemo(() => {
        if (bookingData.clinic === null) return 'clinic';
        if (bookingData.service === null || bookingData.doctor === null) return 'service';
        if (bookingData.dateTime === null) return 'datetime';
        return 'confirm';
    }, [bookingData]);

    const currentStep = useMemo(() => {
        return stepsConfig.find(s => s.id === currentStepId)?.step ?? 1;
    }, [currentStepId]);

    const goToPreviousStep = () => {
        switch (currentStep) {
            case 4:
                updateBookingData({ dateTime: null });
                break;
            case 3:
                updateBookingData({ service: null, doctor: null, dateTime: null });
                break;
            case 2:
                updateBookingData({ clinic: null, service: null, doctor: null, dateTime: null });
                break;
            default:
                break;
        }
    };
    
    const startOver = () => {
        setBookingData({
            clinic: null,
            service: null,
            doctor: null,
            dateTime: null,
        });
    };

    const handleConfirmBooking = async () => {
        if (!bookingData.clinic || !bookingData.service || !bookingData.doctor || !bookingData.dateTime) {
            toast({
                title: "Incomplete Information",
                description: "Please ensure all details are selected before confirming.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await createAppointment({
                clinic_id: bookingData.clinic.id,
                service_id: bookingData.service.id,
                doctor_id: bookingData.doctor.id,
                appointment_time: bookingData.dateTime.toISOString(),
            });
            toast({
                title: "Booking Confirmed!",
                description: "Your appointment has been successfully scheduled.",
            });
            router.push('/appointments');
        } catch (error: any) {
            toast({
                title: "Booking Failed",
                description: error.message || "Could not schedule the appointment. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitting) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-center pt-4 pb-8">
                <Stepper steps={stepsConfig} currentStep={currentStepId} />
            </div>

            <div className="p-1">
                {currentStep === 1 && (
                    <Step1_ClinicSelection
                        onClinicSelect={(clinic) => updateBookingData({ clinic })}
                    />
                )}
                {currentStep === 2 && bookingData.clinic && (
                    <Step2_ServiceAndDoctorSelection
                        clinic={bookingData.clinic}
                        onServiceAndDoctorSelect={(service, doctor) => updateBookingData({ service, doctor })}
                    />
                )}
                {currentStep === 3 && bookingData.clinic && bookingData.service && bookingData.doctor && (
                    <Step3_DateTimeSelection
                        bookingData={bookingData}
                        onDateTimeSelect={(dateTime) => updateBookingData({ dateTime })}
                    />
                )}
                {currentStep === 4 && bookingData.dateTime && (
                    <Step4_Confirmation
                        bookingData={bookingData}
                        onConfirm={handleConfirmBooking}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>
            <div className="flex justify-between items-center mt-8">
                {currentStep > 1 && (
                    <Button variant="outline" onClick={goToPreviousStep} disabled={isSubmitting}>
                        Back
                    </Button>
                )}
                {/* Spacer to keep 'Start Over' on the right */}
                {currentStep === 1 && <div />}
                
                <Button variant="ghost" onClick={startOver} disabled={isSubmitting}>
                    Start Over
                </Button>
            </div>
        </div>
    );
} 