'use client';

import React, { useEffect } from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Info, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { format, addMinutes, setHours, startOfDay } from 'date-fns';
import { AvailabilitySlot } from '@/lib/types/booking';
import { ScrollArea } from '@/components/ui/scroll-area';

const DateTimeSelectionStep: React.FC = () => {
  const { state, dispatch } = useBookingContext();
  const { 
    selectedClinic,
    selectedService,
    selectedDate,
    selectedTimeSlot,
    availabilitySlots,
    isLoading,
    errors,
  } = state;

  useEffect(() => {
    // Generate static slots from 9 AM to 10 PM if a date is selected
    if (selectedDate) {
      const allSlots: AvailabilitySlot[] = [];
      const day = startOfDay(selectedDate);
      const startTime = setHours(day, 9); // 9:00 AM
      const endTime = setHours(day, 22); // 10:00 PM

      let currentTime = startTime;
      while (currentTime < endTime) {
        const slot = {
          slotId: currentTime.toISOString(),
          startTime: currentTime.toISOString(),
          endTime: addMinutes(currentTime, 30).toISOString(),
        };
        allSlots.push(slot);
        currentTime = addMinutes(currentTime, 30);
      }
      dispatch({ type: 'SET_AVAILABILITY_SUCCESS', payload: allSlots });
    } else {
      // Clear slots if no date is selected
      dispatch({ type: 'SET_AVAILABILITY_SUCCESS', payload: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    dispatch({ type: 'SELECT_TIME_SLOT', payload: null });
    dispatch({ type: 'SELECT_DATE', payload: date || null });
  };

  const handleTimeSlotSelect = (slot: AvailabilitySlot) => {
    dispatch({ type: 'SELECT_TIME_SLOT', payload: slot });
  };
  
  const goToNextStep = () => {
    if (selectedDate && selectedTimeSlot) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
    }
  };

  const goToPreviousStep = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 1 });
  };

  if (!selectedClinic || !selectedService) {
    return (
        <Card className="w-full shadow-xl">
            <CardHeader>
                <CardTitle>Step 2: Select Date & Time</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Missing Information</AlertTitle>
                    <AlertDescription>Please go back and select a clinic and service first.</AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
                <Button variant="outline" onClick={goToPreviousStep}>Back to Clinic & Service</Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle>Step 2: Select Date & Time</CardTitle>
        <CardDescription>Pick a date and time for your &apos;{selectedService.name}&apos; appointment at {selectedClinic.name}.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-medium mb-2 flex items-center"><CalendarIcon className="mr-2 h-5 w-5" />Select a Date</h4>
          <div className="border rounded-md flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
              initialFocus
            />
          </div>
        </div>
        <div>
          <h4 className="font-medium mb-2 flex items-center"><Clock className="mr-2 h-5 w-5" />Select a Time</h4>
          
          {isLoading.availabilitySlots && <div className="flex items-center space-x-2 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> <span>Loading times...</span></div>}

          {errors.availabilitySlots && (
             <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Error Loading Times</AlertTitle>
                <AlertDescription>{errors.availabilitySlots}</AlertDescription>
            </Alert>
          )}

          {!isLoading.availabilitySlots && !errors.availabilitySlots && selectedDate && availabilitySlots.length > 0 && (
            <ScrollArea className="h-60">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pr-4">
                {availabilitySlots.map((slot) => (
                  <Button
                    key={slot.slotId}
                    variant={selectedTimeSlot?.slotId === slot.slotId ? 'default' : 'outline'}
                    onClick={() => handleTimeSlotSelect(slot)}
                  >
                    {format(new Date(slot.startTime), 'p')}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}

          {!isLoading.availabilitySlots && !errors.availabilitySlots && selectedDate && availabilitySlots.length === 0 && (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Available Slots</AlertTitle>
                <AlertDescription>There are no available time slots for this service on the selected date. Please pick another day.</AlertDescription>
            </Alert>
          )}

          {!selectedDate && !isLoading.availabilitySlots && (
             <Alert variant="default">
                <Info className="h-4 w-4" />
                <AlertTitle>Select a date</AlertTitle>
                <AlertDescription>Please select a date from the calendar to see available times.</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="outline" onClick={goToPreviousStep} disabled={isLoading.availabilitySlots}>Back</Button>
        <Button onClick={goToNextStep} disabled={!selectedTimeSlot || isLoading.availabilitySlots} size="lg">Next: Confirm Details</Button>
      </CardFooter>
    </Card>
  );
};

export default DateTimeSelectionStep;