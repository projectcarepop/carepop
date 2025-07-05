"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// We'll define the steps for the wizard
const steps = [
  { id: 'service', title: 'Select Service & Doctor' },
  { id: 'time', title: 'Choose Date & Time' },
  { id: 'confirm', title: 'Confirm Details' },
];

// Define props based on what the wizard will need to function
interface BookingWizardProps {
  clinicId: string;
  // services: Service[]; // Example prop
}

export default function BookingWizard({ clinicId }: BookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'service':
        return <div>Service and Doctor Selection Content for Clinic: {clinicId}</div>;
      case 'time':
        return <div>Date and Time Selection Content</div>;
      case 'confirm':
        return <div>Confirmation Content</div>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          Book an Appointment - Step {currentStep + 1}: {steps[currentStep].title}
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-[200px]">
        {renderStepContent()}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
          Back
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button>Confirm Appointment</Button>
        )}
      </CardFooter>
    </Card>
  );
}