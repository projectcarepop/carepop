'use client';

import * as React from 'react';
import { Dispatch, SetStateAction, useEffect } from 'react'; // Added useEffect
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MessageSquare } from 'lucide-react'; // Renamed Calendar to CalendarIcon
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card'; // Added Card, CardContent

// Mock Data (In a real app, fetch based on selectedProviderId and selectedDate)
interface TimeSlot {
  time: string;
  available: boolean;
}

// Function to generate mock time slots for a given date (and potentially provider)
const getMockTimeSlots = (date?: Date, providerId?: string | null): TimeSlot[] => {
  if (!date || !providerId) return [];

  // Simple mock: vary slots by day of week and provider
  const dayOfWeek = date.getDay();
  const seed = dayOfWeek + (providerId ? parseInt(providerId.slice(-1), 16) % 3 : 0); // Create some variation

  const slots: TimeSlot[] = [];
  for (let i = 9; i <= 17; i++) {
    slots.push({ time: `${String(i).padStart(2, '0')}:00`, available: (i + seed) % (seed % 2 === 0 ? 2 : 3) === 0 });
    if (i < 17) {
      slots.push({ time: `${String(i).padStart(2, '0')}:30`, available: (i + seed + 1) % (seed % 2 !== 0 ? 2 : 3) === 0 });
    }
  }
  // Filter out some slots to make it more realistic
  return slots.filter((_, index) => (index + seed) % 2 === 0);
};

interface DateTimeSelectionStepProps {
  selectedProviderId: string | null; // Used to fetch/filter time slots
  selectedDate: Date | undefined;
  setSelectedDate: Dispatch<SetStateAction<Date | undefined>>;
  selectedTimeSlot: string | null;
  setSelectedTimeSlot: Dispatch<SetStateAction<string | null>>;
  appointmentNotes?: string;
  setAppointmentNotes?: Dispatch<SetStateAction<string>>;
}

const DateTimeSelectionStep: React.FC<DateTimeSelectionStepProps> = ({
  selectedProviderId,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  appointmentNotes,
  setAppointmentNotes,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to the start of the day

  const [availableTimeSlots, setAvailableTimeSlots] = React.useState<TimeSlot[]>([]);

  useEffect(() => {
    if (selectedDate && selectedProviderId) {
      // In a real app, you would fetch this data from an API
      const slots = getMockTimeSlots(selectedDate, selectedProviderId);
      setAvailableTimeSlots(slots);
    } else {
      setAvailableTimeSlots([]);
    }
    setSelectedTimeSlot(null); // Reset time slot when date or provider changes
  }, [selectedDate, selectedProviderId, setSelectedTimeSlot]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const handleTimeSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAppointmentNotes?.(e.target.value);
  };

  if (!selectedProviderId) {
    return (
      <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center min-h-[200px] flex flex-col justify-center items-center">
        <Clock className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">
          Please select a provider first.
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Date and time selection will be available once a provider is chosen.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6')}>
       <div className="space-y-2">
        <h3 className="text-xl font-semibold tracking-tight text-center sm:text-left">
          Schedule Your Appointment
        </h3>
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          Choose a suitable date and time, and add any notes for your provider.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Date Selection */}
        <div className="space-y-3">
            <div className="flex items-center text-base font-medium">
                <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                <span>Select Date</span>
            </div>
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={[{ before: today }]}
                    className="w-full"
                    initialFocus
                    />
                </CardContent>
            </Card>
        </div>

        {/* Time Slot Selection */}
        <div className="space-y-3">
            <div className="flex items-center text-base font-medium">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                <span>Select Time Slot</span>
            </div>
            <Card className="h-[360px] flex flex-col"> {/* Fixed height for consistency */}
                <CardContent className="p-4 flex-grow flex flex-col">
                    {selectedDate ? (
                        availableTimeSlots.length > 0 ? (
                        <ScrollArea className="flex-grow pr-3 -mr-3"> {/* Offset padding for scrollbar */}
                            <div className="mb-3">
                                <p className="text-sm font-medium text-center">
                                Available on {format(selectedDate, "EEEE, MMMM d")}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {availableTimeSlots.map(({ time, available }) => (
                                <Button
                                key={time}
                                variant={selectedTimeSlot === time ? 'default' : 'outline'}
                                size="default" // Slightly larger buttons
                                className="w-full h-11 text-sm" // Ensure consistent height
                                onClick={() => handleTimeSelect(time)}
                                disabled={!available}
                                >
                                {time}
                                </Button>
                            ))}
                            </div>
                        </ScrollArea>
                        ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                            <Clock className="w-10 h-10 text-muted-foreground mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">
                                No time slots available for {format(selectedDate, "MMMM d, yyyy")}.
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Please try another date.</p>
                        </div>
                        )
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                            <CalendarIcon className="w-10 h-10 text-muted-foreground mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">Please select a date first.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>

        {/* Appointment Notes */}
        <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center text-base font-medium">
                <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                <span>Notes for Provider (Optional)</span>
            </div>
            <Textarea
                placeholder="E.g., specific concerns, accessibility needs, or reason for visit if not covered by service selection."
                className="min-h-[100px] text-sm"
                value={appointmentNotes || ''}
                onChange={handleNotesChange}
            />
        </div>
    </div>
  );
};

export default DateTimeSelectionStep; 