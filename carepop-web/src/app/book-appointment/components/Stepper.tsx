'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn('relative', {
              'pr-8 sm:pr-20': index !== steps.length - 1,
            })}
          >
            {index < currentIndex ? (
              // Completed Step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-primary" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary"
                >
                  <Check className="h-5 w-5 text-white" aria-hidden="true" />
                </div>
                <p className="absolute -bottom-6 text-xs text-center w-full">{step.label}</p>
              </>
            ) : index === currentIndex ? (
              // Current Step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white"
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                </div>
                <p className="absolute -bottom-6 text-xs text-center w-full font-semibold text-primary">{step.label}</p>
              </>
            ) : (
              // Upcoming Step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div
                  className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-transparent"
                    aria-hidden="true"
                  />
                </div>
                 <p className="absolute -bottom-6 text-xs text-center w-full text-gray-500">{step.label}</p>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}; 