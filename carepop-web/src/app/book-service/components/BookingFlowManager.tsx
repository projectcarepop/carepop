'use client';

import React, { useState } from 'react';
import ClinicServiceSelectionStep from './ClinicServiceSelectionStep';
import ProviderSelectionStep from './ProviderSelectionStep';
// import DateTimeSelectionStep from './DateTimeSelectionStep'; // Placeholder for next step
// import ConfirmationStep from './ConfirmationStep'; // Placeholder for final step
// No Button import needed here

export type BookingStep = 
  | 'clinicServiceSelection' 
  | 'providerSelection'
  | 'dateTimeSelection' 
  | 'confirmation';

export interface BookingData {
  clinicId: string | null;
  serviceId: string | null;
  providerId: string | null;
  dateTime: Date | null;
  serviceName: string | null;
  clinicName: string | null;
  price: number | null;
  duration: string | null; 
  requiresProviderAssignment: boolean | null;
}

export default function BookingFlowManager() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('clinicServiceSelection');
  const [bookingData, setBookingData] = useState<BookingData>({
    clinicId: null,
    serviceId: null, 
    providerId: null,
    dateTime: null,
    serviceName: null,
    clinicName: null,
    price: null,
    duration: null,
    requiresProviderAssignment: null,
  });

  const handleNextFromClinicService = (data: { 
    clinicId: string; 
    serviceId: string; 
    clinicName: string; 
    serviceName: string; 
    price?: number | null; 
    duration?: string | null; 
    requiresProviderAssignment: boolean;
  }) => {
    setBookingData(prev => ({ 
      ...prev, 
      clinicId: data.clinicId, 
      serviceId: data.serviceId,
      clinicName: data.clinicName,
      serviceName: data.serviceName,
      price: data.price !== undefined ? data.price : null, 
      duration: data.duration !== undefined ? data.duration : null, 
      requiresProviderAssignment: data.requiresProviderAssignment,
      providerId: null,
      dateTime: null,
    }));
    setCurrentStep('providerSelection');
  };

  const handleNextFromProviderSelection = (selectedProviderId: string | null) => {
    setBookingData(prev => ({
      ...prev,
      providerId: selectedProviderId,
    }));
    alert('Selected Provider (or skipped). Data: ' + JSON.stringify({...bookingData, providerId: selectedProviderId}) + '\nProceeding to DateTime selection (Not Implemented Yet)');
  };

  const handleBackToClinicService = () => {
    setCurrentStep('clinicServiceSelection');
  };

  const updateSelectedClinic = (newClinicId: string | null) => {
    setBookingData(prev => ({
      ...prev,
      clinicId: newClinicId,
      serviceId: null,
      serviceName: null,
      price: null,
      duration: null,
      requiresProviderAssignment: null,
      providerId: null,
      dateTime: null,
    }));
  };

  const updateSelectedService = (newServiceId: string | null, serviceDetails?: { name: string; price?: number | null; duration?: string | null; requiresProviderAssignment: boolean; }) => {
    setBookingData(prev => ({
      ...prev,
      serviceId: newServiceId,
      serviceName: serviceDetails?.name || null,
      price: serviceDetails?.price !== undefined ? serviceDetails.price : null,
      duration: serviceDetails?.duration !== undefined ? serviceDetails.duration : null,
      requiresProviderAssignment: serviceDetails?.requiresProviderAssignment !== undefined ? serviceDetails.requiresProviderAssignment : null,
      providerId: null,
      dateTime: null,
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'clinicServiceSelection':
        return (
          <ClinicServiceSelectionStep 
            selectedClinicId={bookingData.clinicId}
            setSelectedClinicId={updateSelectedClinic}
            selectedServiceId={bookingData.serviceId}
            setSelectedServiceId={updateSelectedService} 
            onNext={handleNextFromClinicService} 
          />
        );
      case 'providerSelection':
        return (
          <ProviderSelectionStep
            selectedClinicId={bookingData.clinicId}
            selectedService={{
              id: bookingData.serviceId,
              name: bookingData.serviceName,
              requires_provider_assignment: bookingData.requiresProviderAssignment
            }}
            onNext={handleNextFromProviderSelection}
            onBack={handleBackToClinicService}
          />
        );
      // case 'dateTimeSelection':
      //   return (
      //     <DateTimeSelectionStep 
      //       bookingData={bookingData}
      //       onNext={(selectedDateTime) => {
      //         setBookingData(prev => ({...prev, dateTime: selectedDateTime}));
      //         setCurrentStep('confirmation');
      //       }}
      //       onBack={handleBackToProviderSelection}
      //     />
      //   );
      // case 'confirmation':
      //   // ... ConfirmationStep from previous example
      default:
        return <p>Unknown booking step.</p>;
    }
  };

  return (
    <div>
      {/* Progress Bar can be added here later */}
      {renderStep()}
    </div>
  );
} 