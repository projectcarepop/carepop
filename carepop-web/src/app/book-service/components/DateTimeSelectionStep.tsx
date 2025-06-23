'use client';

import React, { useEffect } from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Info, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { useAuth } from '@clerk/nextjs';
import { getProviderAvailability } from '@/lib/apiClient';
import { AvailabilitySlot } from '@/lib/types/booking';

const DateTimeSelectionStep: React.FC = () => {
  const { state, dispatch } = useBookingContext();
  const { getToken, isSignedIn } = useAuth();
  const { 
    selectedClinic,
    selectedService,
    selectedProvider,
    selectedDate,
    selectedTimeSlot,
    availabilitySlots,
    isLoading,
    errors 
  } = state;

  // Step-skipping logic: If the service doesn't require a provider, advance immediately.
  useEffect(() => {
    if (selectedService && selectedService.requiresProviderAssignment === false) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: 4 }); // Skip to confirmation/details step
    }
  }, [selectedService, dispatch]);

  const fetchAvailability = async (providerId: string, date: Date) => {
    if (!isSignedIn) {
      dispatch({ type: 'SET_AVAILABILITY_ERROR', payload: 'You must be logged in to view availability.' });
      return;
    }
    dispatch({ type: 'SET_AVAILABILITY_LOADING', payload: true });
    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication token not found.");

      const dateString = format(date, 'yyyy-MM-dd');
      const timeStrings = await getProviderAvailability(token, providerId, dateString);
      
      const slots: AvailabilitySlot[] = timeStrings.map(time => {
        const [hour, minute] = time.split(':').map(Number);
        const startTime = new Date(date);
        startTime.setHours(hour, minute, 0, 0);

        return {
          slotId: `${dateString}-${time}`,
          startTime: startTime.toISOString(),
          // End time can be calculated if needed, e.g., add 30 mins
        };
      });

      dispatch({ type: 'SET_AVAILABILITY_SUCCESS', payload: slots });
    } catch (error) {
      console.error("Error fetching availability:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      dispatch({ type: 'SET_AVAILABILITY_ERROR', payload: `We couldn't load availability. ${errorMessage}` });
    }
  };

  useEffect(() => {
    // Only fetch if a provider is selected and a date is chosen.
    // The service check handles cases where no provider is needed.
    if (selectedProvider && selectedDate && isSignedIn) {
      fetchAvailability(selectedProvider.id, selectedDate);
    } else {
      // Clear slots if dependencies change and are no longer valid
      dispatch({ type: 'SET_AVAILABILITY_SUCCESS', payload: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvider, selectedDate, isSignedIn]);

  const handleDateSelect = (date: Date | undefined) => {
    dispatch({ type: 'SELECT_TIME_SLOT', payload: null }); // Reset time when date changes
    dispatch({ type: 'SELECT_DATE', payload: date || null });
  };

  const handleTimeSlotSelect = (slot: AvailabilitySlot) => {
    dispatch({ type: 'SELECT_TIME_SLOT', payload: slot });
  };
  
  const goToNextStep = () => {
    if (selectedDate && selectedTimeSlot) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: 4 });
    }
  };

  const goToPreviousStep = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 2 });
  };

  // If the service doesn't require a provider, this step will be skipped by the useEffect.
  // We can show a loading or redirecting state.
  if (selectedService && selectedService.requiresProviderAssignment === false) {
      return (
          <Card className="w-full shadow-xl animate-pulse">
              <CardHeader><CardTitle>Configuring Appointment</CardTitle></CardHeader>
              <CardContent><p>This service does not require a specific provider. Proceeding to the next step...</p></CardContent>
          </Card>
      );
  }

  // If we land here and don't have the required data, show an info message.
  if (!selectedProvider || !selectedClinic || !selectedService) {
    return (
        <Card className="w-full shadow-xl">
            <CardHeader>
                <CardTitle>Step 3: Select Date & Time</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Missing Information</AlertTitle>
                    <AlertDescription>Please go back and select a clinic, service, and provider first.</AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
                <Button variant="outline" onClick={goToPreviousStep}>Back to Provider</Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle>Step 3: Select Date & Time</CardTitle>
        <CardDescription>Pick a date and time for your appointment with {selectedProvider.profile?.firstName}.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-medium mb-2 flex items-center"><CalendarIcon className="mr-2 h-5 w-5" />Select a Date</h4>
          <div className="border rounded-md flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} // Disable past dates
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
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errors.availabilitySlots}</AlertDescription>
            </Alert>
          )}

          {!isLoading.availabilitySlots && selectedDate && availabilitySlots.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
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
          )}

          {!isLoading.availabilitySlots && selectedDate && availabilitySlots.length === 0 && !errors.availabilitySlots && (
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No Available Slots</AlertTitle>
                <AlertDescription>There are no available time slots for this provider on the selected date. Please pick another day.</AlertDescription>
            </Alert>
          )}

          {!selectedDate && !isLoading.availabilitySlots && !errors.availabilitySlots && (
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