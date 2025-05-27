'use client';

import * as React from 'react';
import { Dispatch, SetStateAction, useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIconLucide, Clock, MessageSquare, AlertTriangle, Loader2 } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card'; 
import { getAvailabilityAction, AvailabilitySlot } from '@/lib/actions/availability'; // Import server action
import { toast } from 'sonner';

// Mock Data function getMockTimeSlots is removed as we'll use API data.

interface DateTimeSelectionStepProps {
  selectedClinicId: string | null; // Added: Needed for API call
  selectedServiceId: string | null; // Added: Needed for API call
  selectedProviderId: string | null; 
  selectedDate: Date | undefined;
  setSelectedDate: Dispatch<SetStateAction<Date | undefined>>;
  selectedTimeSlot: string | null;
  setSelectedTimeSlot: Dispatch<SetStateAction<string | null>>;
  appointmentNotes?: string;
  setAppointmentNotes?: Dispatch<SetStateAction<string>>;
  // Add selectedService.requiresProviderAssignment to better handle UI messaging
  serviceRequiresProvider: boolean;
}

const DateTimeSelectionStep: React.FC<DateTimeSelectionStepProps> = ({
  selectedClinicId,
  selectedServiceId,
  selectedProviderId,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  appointmentNotes,
  setAppointmentNotes,
  serviceRequiresProvider,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 

  const [availableTimeSlots, setAvailableTimeSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!selectedDate || !selectedClinicId || !selectedServiceId) {
      setAvailableTimeSlots([]);
      return;
    }
    // If service requires a provider, but none is selected, don't fetch.
    // BookingForm should ideally prevent reaching this state if provider is mandatory.
    if (serviceRequiresProvider && !selectedProviderId) {
        setSlotsError("Provider is required for this service, but none selected. Please go back.");
        setAvailableTimeSlots([]);
        return;
    }

    setIsLoadingSlots(true);
    setSlotsError(null);
    setAvailableTimeSlots([]); // Clear previous slots

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const result = await getAvailabilityAction({
        clinicId: selectedClinicId,
        serviceId: selectedServiceId,
        providerId: selectedProviderId, // Can be null if service does not require a provider
        date: formattedDate,
      });

      if (result.success && result.data) {
        setAvailableTimeSlots(result.data);
      } else {
        setSlotsError(result.message || 'Failed to load availability.');
        toast.error('Could not load time slots', { description: result.message });
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
      setSlotsError(errorMessage);
      toast.error('Error fetching time slots', { description: errorMessage });
    }
    setIsLoadingSlots(false);
  }, [selectedDate, selectedClinicId, selectedServiceId, selectedProviderId, serviceRequiresProvider]);

  useEffect(() => {
    if (selectedDate) { // Fetch only if a date is selected
        fetchAvailability();
    }
    setSelectedTimeSlot(null); // Reset time slot when date or other dependencies change
  }, [selectedDate, fetchAvailability, setSelectedTimeSlot]); // Added fetchAvailability to dependency array

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate);
      // Time slots will be fetched by the useEffect above
    } else {
      setSelectedDate(undefined);
      setAvailableTimeSlots([]); // Clear slots if date is cleared
    }
  };

  const handleTimeSelect = (slot: AvailabilitySlot) => {
    // Assuming slot.start_time is the value to store, e.g., "09:00:00"
    setSelectedTimeSlot(slot.start_time);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAppointmentNotes?.(e.target.value);
  };

  // UI Message if required IDs are missing for context
  if (!selectedClinicId || !selectedServiceId) {
    return (
      <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center min-h-[200px] flex flex-col justify-center items-center">
        <Clock className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">
          Please select clinic and service first.
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Date and time selection will be available after clinic and service are chosen.
        </p>
      </div>
    );
  }
  // UI Message if service requires provider, but none is selected (redundant if BookingForm handles this)
  if (serviceRequiresProvider && !selectedProviderId) {
    return (
      <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-8 text-center min-h-[200px] flex flex-col justify-center items-center">
        <Clock className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground">
          Please select a provider for this service.
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          A provider is required before selecting date and time.
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
        <div className="space-y-3">
            <div className="flex items-center text-base font-medium">
                <CalendarIconLucide className="mr-2 h-5 w-5 text-primary" />
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

        <div className="space-y-3">
            <div className="flex items-center text-base font-medium">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                <span>Select Time Slot</span>
            </div>
            <Card className="h-[360px] flex flex-col">
                <CardContent className="p-4 flex-grow flex flex-col">
                    {!selectedDate && (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                            <CalendarIconLucide className="w-10 h-10 text-muted-foreground mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">Please select a date first.</p>
                        </div>
                    )}
                    {selectedDate && isLoadingSlots && (
                        <div className="flex-grow flex flex-col items-center justify-center">
                            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                            <p className="text-sm text-muted-foreground">Loading time slots...</p>
                        </div>
                    )}
                    {selectedDate && !isLoadingSlots && slotsError && (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                            <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
                            <p className="text-sm font-medium text-destructive">Error Loading Slots</p>
                            <p className="text-xs text-destructive/80 mt-1">{slotsError}</p>
                            <Button onClick={fetchAvailability} variant="destructive" size="sm" className="mt-3">Try Again</Button>
                        </div>
                    )}
                    {selectedDate && !isLoadingSlots && !slotsError && availableTimeSlots.length > 0 && (
                        <ScrollArea className="flex-grow pr-3 -mr-3">
                            <div className="mb-3">
                                <p className="text-sm font-medium text-center">
                                Available on {format(selectedDate, "EEEE, MMMM d")}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {availableTimeSlots.map((slot) => (
                                <Button
                                key={slot.start_time}
                                variant={selectedTimeSlot === slot.start_time ? 'default' : 'outline'}
                                size="default"
                                className="w-full h-11 text-sm"
                                onClick={() => handleTimeSelect(slot)}
                                // disabled={!slot.available} // Assuming all returned slots are available
                                >
                                {format(new Date(`1970-01-01T${slot.start_time}`), 'h:mm a')} {/* Format time for display */}
                                </Button>
                            ))}
                            </div>
                        </ScrollArea>
                    )}
                    {selectedDate && !isLoadingSlots && !slotsError && availableTimeSlots.length === 0 && (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                            <Clock className="w-10 h-10 text-muted-foreground mb-3" />
                            <p className="text-sm font-medium text-muted-foreground">
                                No time slots available for {format(selectedDate, "MMMM d, yyyy")}.
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Please try another date.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>

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