'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getClinicServices, getServiceProviders } from '@/services/api';
import type { BookingData } from './BookingFlowManager';
import { type Service, type Doctor } from '@/lib/types/bookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
    queryKey: ['clinicDetails', bookingData.clinic?.id],
    queryFn: () => getClinicServices(bookingData.clinic!.id),
    enabled: !!bookingData.clinic?.id,
  });

  const {
    data: doctors,
    isLoading: isLoadingDoctors,
  } = useQuery({
    queryKey: ['providersForService', selectedServiceId, bookingData.clinic?.id],
    queryFn: () => getServiceProviders(selectedServiceId!, bookingData.clinic!.id),
    enabled: !!selectedServiceId && !!bookingData.clinic?.id,
    select: (data) => data.data,
  });

  const services = clinicDetails?.services || [];
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setSelectedServiceId(service.id);
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    if (!selectedService) return;
    updateBookingData({ service: selectedService, doctor });
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

  if (!bookingData.clinic) {
    return <div className="text-center text-red-500">Please go back and select a clinic first.</div>
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Select a Service and Doctor</h2>
        <p className="text-muted-foreground">
          You are booking an appointment at <span className="font-semibold text-primary">{bookingData.clinic.name}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Service Selection */}
        <div className="space-y-2">
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
                    services.map((service: Service) => (
                      <div
                        key={service.id}
                        className="p-4 border rounded-md cursor-pointer hover:bg-accent"
                        onClick={() => handleSelectService(service)}
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
                      {doctors && doctors.length > 0 ? (
                          doctors.map((doctor: Doctor) => (
                          <div
                              key={doctor.id}
                              className="p-4 border rounded-md cursor-pointer hover:bg-accent flex items-center gap-4"
                              onClick={() => handleSelectDoctor(doctor)}
                          >
                              <img src={doctor.avatarUrl || '/avatar-placeholder.png'} alt={doctor.fullName} className="w-16 h-16 rounded-full bg-muted" />
                              <div>
                              <h3 className="font-semibold">{doctor.fullName}</h3>
                              <p className="text-sm text-muted-foreground">{doctor.specialtyText}</p>
                              </div>
                          </div>
                          ))
                      ) : (
                          <div className="text-center text-muted-foreground py-8">
                              <p>No doctors are available for this service. Please select another service or go back.</p>
                          </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 