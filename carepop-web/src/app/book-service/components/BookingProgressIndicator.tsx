'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  name: string;
  description?: string;
}

interface BookingProgressIndicatorProps {
  steps: Step[];
  currentStepIndex: number;
}

const BookingProgressIndicator = ({
  steps,
  currentStepIndex,
}: BookingProgressIndicatorProps) => {
  return (
    <div className="relative mb-12 w-full px-4 md:px-0">
      <div className="flex items-start justify-between w-full">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex flex-col items-center text-center relative z-10 flex-1 min-w-0 px-1"
          >
            <div
              className={cn(
                'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 mb-2.5 shadow-sm',
                index < currentStepIndex
                  ? 'bg-primary border-primary text-primary-foreground shadow-md'
                  : index === currentStepIndex
                  ? 'bg-background border-primary ring-2 ring-primary ring-offset-2 ring-offset-background text-primary scale-110 shadow-lg'
                  : 'bg-muted border-gray-300 text-gray-500'
              )}
            >
              {index < currentStepIndex ? (
                <CheckCircle2 className="h-5 w-5 md:h-6" />
              ) : (
                <span className="text-sm md:text-base font-semibold">{index + 1}</span>
              )}
            </div>
            <p
              className={cn(
                'text-xs sm:text-sm font-medium line-clamp-2 leading-tight px-1',
                index === currentStepIndex
                  ? 'text-primary font-semibold'
                  : index < currentStepIndex
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {step.name}
            </p>
            {/* Render step.description if provided */}
            {step.description && 
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 px-1">
                {step.description}
              </p>
            }
          </div>
        ))}
      </div>
      <div className="absolute top-5 md:top-6 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0">
        <motion.div
          className="h-full bg-primary origin-left"
          initial={{ scaleX: 0 }}
          animate={{
            scaleX: steps.length > 1 ? (currentStepIndex) / (steps.length - 1) : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 180,
            damping: 22,
            mass: 0.9,
          }}
        />
      </div>
    </div>
  );
};

export default BookingProgressIndicator; 