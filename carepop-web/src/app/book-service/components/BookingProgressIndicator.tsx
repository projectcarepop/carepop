'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  name: string;
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
    <div className="relative mb-12">
      <div className="flex items-start justify-between w-full">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex flex-col items-center text-center relative z-10 w-1/4 px-2"
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 mb-2',
                index < currentStepIndex
                  ? 'bg-primary border-primary text-primary-foreground'
                  : index === currentStepIndex
                  ? 'bg-background border-primary text-primary scale-110' // Emphasize current step
                  : 'bg-muted border-muted-foreground/30 text-muted-foreground'
              )}
            >
              {index < currentStepIndex ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <p
              className={cn(
                'text-xs sm:text-sm font-medium line-clamp-2',
                index === currentStepIndex
                  ? 'text-primary' // Emphasize current step name
                  : index < currentStepIndex
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {step.name}
            </p>
          </div>
        ))}
      </div>
      <div className="absolute top-5 left-0 w-full h-1 bg-muted-foreground/20 -translate-y-1/2 z-0">
        <motion.div
          className="h-full bg-primary origin-left"
          initial={{ scaleX: 0 }}
          animate={{
            scaleX: steps.length > 1 ? currentStepIndex / (steps.length - 1) : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            mass: 0.8,
          }}
        />
      </div>
    </div>
  );
};

export default BookingProgressIndicator; 