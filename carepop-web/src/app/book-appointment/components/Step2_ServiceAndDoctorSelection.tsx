'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClinicDetails, getDoctorsForService } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { BookingData } from './BookingFlowManager';

interface Step2_ServiceAndDoctorSelectionProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

export const Step2_ServiceAndDoctorSelection: React.FC<Step2_ServiceAndDoctorSelectionProps> = ({
  bookingData,
  updateBookingData,
  goToNextStep,
  goToPreviousStep,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const { 
    data: clinicDetails, 
    isLoading: isLoadingClinic, 
    isError, 
    error 
  } = useQuery({
    // The query will only run if clinicId exists.
    queryKey: ['clinicDetails', bookingData.clinicId],
    queryFn: () => getClinicDetails(bookingData.clinicId!),
    enabled: !!bookingData.clinicId,
  });

  const {
    data: doctors,
    isLoading: isLoadingDoctors,
  } = useQuery({
    queryKey: ['doctorsForService', selectedServiceId, bookingData.clinicId],
    queryFn: () => getDoctorsForService(selectedServiceId!, bookingData.clinicId!),
    enabled: !!selectedServiceId && !!bookingData.clinicId,
  });

  const services = clinicDetails?.services || [];

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
  };

  const handleSelectDoctor = (doctorId: string) => {
    if (!selectedServiceId) return;
    updateBookingData({ serviceId: selectedServiceId, doctorId });
    goToNextStep();
  };

  if (isLoadingClinic) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading Services...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was a problem fetching services for this clinic.
          {error && <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>}
        </AlertDescription>
        <button onClick={goToPreviousStep} className="mt-4 text-sm text-blue-600 hover:underline">
          Back to Clinic Selection
        </button>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Select a Service at {clinicDetails?.name}</CardTitle>
          <button onClick={goToPreviousStep} className="text-sm text-blue-600 hover:underline">
            Back
          </button>
        </div>
        <p className="text-muted-foreground text-sm pt-1">
          {selectedServiceId ? "Now, select a professional for your chosen service." : "Start by choosing a service from the list below."}
        </p>
      </CardHeader>
      <CardContent>
        {!selectedServiceId ? (
          <div className="flex flex-col gap-3">
            {services.length > 0 ? (
              services.map((service: any) => (
                <div
                  key={service.id}
                  className="p-4 border rounded-md cursor-pointer hover:bg-accent"
                  onClick={() => handleSelectService(service.id)}
                >
                  <h3 className="font-semibold">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <p className="text-sm font-bold mt-2">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(service.price)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center">No services found for this clinic.</p>
            )}
          </div>
        ) : (
          <div>
            {isLoadingDoctors ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading Doctors...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {doctors?.map((doctor: any) => (
                   <div
                    key={doctor.id}
                    className="p-4 border rounded-md cursor-pointer hover:bg-accent flex items-center gap-4"
                    onClick={() => handleSelectDoctor(doctor.id)}
                  >
                    <img src={doctor.avatarUrl || '/avatar-placeholder.png'} alt={doctor.fullName} className="w-16 h-16 rounded-full bg-muted" />
                    <div>
                      <h3 className="font-semibold">{doctor.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{doctor.specialtyText}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 