'use client';

import React, { useEffect, useState } from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { AvailabilitySlot } from '@/lib/types/booking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar"; // Assuming Shadcn UI Calendar
import { Loader2, CalendarDays, Clock, Info } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isSameDay, parseISO, getMonth, getYear } from 'date-fns';
import { ScrollArea } from "@/components/ui/scroll-area"; // Added ScrollArea import

const DateTimeSelectionStep: React.FC = () => {
  const { state, dispatch } = useBookingContext();
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

  // Local state for the calendar month being viewed
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate || new Date());

  useEffect(() => {
    if (selectedProvider && selectedClinic && selectedService) {
      dispatch({ type: 'SET_AVAILABILITY_LOADING', payload: true });
      
      const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const queryParams = new URLSearchParams({
        clinicId: selectedClinic.id,
        serviceId: selectedService.id,
        startDate: startDate,
        endDate: endDate
      }).toString();

      // API Call: GET /api/availability/provider/:providerId/slots (Backend Integration Guide - Section 3.1)
      fetch(`/api/v1/availability/provider/${selectedProvider.id}/slots?${queryParams}&_cb=${new Date().getTime()}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          // Assuming the actual API response structure is { success: boolean, data: YourGroupedArrayType[] } or similar
          // If 'data' itself is the array of grouped day slots, then use data.reduce directly.
          // For this example, let's assume the grouped array is in data.data as per previous discussions.
          if (data && typeof data.success === 'boolean') { // Check if data is the wrapper object
            if (data.success && Array.isArray(data.data)) {
              const flatSlots: AvailabilitySlot[] = data.data.reduce((acc: AvailabilitySlot[], dayGroup: { date: string, slots: Array<{startTime: string, endTime: string, slotId?: string}> }) => {
                dayGroup.slots.forEach(slot => {
                  acc.push({
                    ...slot,
                    slotId: slot.slotId || slot.startTime // Ensure slotId is present
                  });
                });
                return acc;
              }, []);
              dispatch({ type: 'SET_AVAILABILITY_SUCCESS', payload: flatSlots });
            } else if (!data.success) {
              dispatch({ type: 'SET_AVAILABILITY_ERROR', payload: data.message || 'Failed to fetch availability (API error).' });
            }
          } else if (Array.isArray(data)) { 
            // Fallback if 'data' is the array of grouped day slots directly (no {success: ..., data: ...} wrapper)
             const flatSlots: AvailabilitySlot[] = data.reduce((acc: AvailabilitySlot[], dayGroup: { date: string, slots: Array<{startTime: string, endTime: string, slotId?: string}> }) => {
                dayGroup.slots.forEach(slot => {
                  acc.push({
                    ...slot,
                    slotId: slot.slotId || slot.startTime
                  });
                });
                return acc;
              }, []);
              dispatch({ type: 'SET_AVAILABILITY_SUCCESS', payload: flatSlots });
          } else {
            // Unexpected response structure
            console.error("Unexpected API response structure:", data);
            dispatch({ type: 'SET_AVAILABILITY_ERROR', payload: 'Received malformed data from server.' });
          }
        })
        .catch((error) => {
          console.error("Error fetching availability:", error);
          dispatch({ type: 'SET_AVAILABILITY_ERROR', payload: error.message || 'An error occurred while fetching availability.' });
        });
    } else {
        dispatch({ type: 'SET_AVAILABILITY_SUCCESS', payload: [] });
    }
  }, [selectedProvider, selectedClinic, selectedService, currentMonth, dispatch]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      dispatch({ type: 'SELECT_DATE', payload: date });
      // If month changes, useEffect will refetch. If same month, no auto-refetch unless currentMonth state is also managed by calendar.
      if (getMonth(date) !== getMonth(currentMonth) || getYear(date) !== getYear(currentMonth)) {
        setCurrentMonth(date);
      }
    }
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

  const getSlotsForSelectedDate = () => {
    if (!selectedDate) return [];
    return availabilitySlots.filter(slot => 
      isSameDay(parseISO(slot.startTime), selectedDate)
    ).sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
  };

  const dailySlots = getSlotsForSelectedDate();

  // Highlight days with available slots
  const highlightDays = availabilitySlots.map(slot => parseISO(slot.startTime));
  const modifiers = { available: highlightDays };
  const modifiersClassNames = {
    available: 'bg-primary/20 text-primary-foreground rounded-full'
  };

  if (!selectedProvider || !selectedClinic || !selectedService) {
    return (
        <Card className="w-full shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Step 3: Select Date & Time</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="default" className="border-primary/50">
                    <Info className="h-5 w-5 mr-2 text-primary"/>
                    <AlertTitle className="font-semibold text-primary">Missing Information</AlertTitle>
                    <AlertDescription>
                        Please go back and select a clinic, service, and provider first.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter className="flex justify-start">
                <Button variant="outline" onClick={goToPreviousStep}>Back to Provider Selection</Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Step 3: Select Date & Time</CardTitle>
        <CardDescription className="text-md">
          Pick a date and time for your appointment with {selectedProvider.fullName} for {selectedService.name}.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col"> 
        {/* Calendar View - Simplified container, added border-b */}
        <div className="flex flex-col items-center p-4 border-b border-border">
          <h4 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
            <CalendarDays className="mr-2 h-6 w-6 text-primary" />
            Select a Date
          </h4>
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            onSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) }
            className="w-full max-w-md" 
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
          />
        </div>

        {/* Time Slots View - Simplified container */}
        <div className="flex flex-col p-4">
          <div className="flex items-center text-lg font-semibold text-gray-800 mb-2">
            <Clock className="mr-2 h-6 w-6 text-primary" />
            Available Times 
            {selectedDate && <span className="text-primary ml-1.5">{format(selectedDate, 'EEEE, MMM d')}</span>}
          </div>
          
          <div className="relative flex-1 min-h-[250px]"> {/* Ensured min-height for scroll area content */}
            <ScrollArea className="absolute inset-0 pr-2"> {/* Added pr-2 to prevent scrollbar overlap */}
              {isLoading.availabilitySlots && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" /> 
                </div>
              )}
              {errors.availabilitySlots && (
                <div className="flex items-center justify-center h-full">
                  <Alert variant="destructive" className="m-4">
                    <Info className="h-5 w-5 mr-2"/>
                    <AlertTitle>Error Loading Slots</AlertTitle>
                    <AlertDescription>{errors.availabilitySlots}</AlertDescription>
                  </Alert>
                </div>
              )}
              
              {!isLoading.availabilitySlots && !errors.availabilitySlots && !selectedDate && (
                <div className="flex items-center justify-center h-full">
                  <Alert variant="default" className="border-blue-400/50 m-4">
                    <Info className="h-5 w-5 mr-2 text-blue-500"/>
                    <AlertTitle className="font-semibold text-blue-600">Select a Date</AlertTitle>
                    <AlertDescription>
                      Please pick a date from the calendar to see available time slots.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {!isLoading.availabilitySlots && !errors.availabilitySlots && selectedDate && dailySlots.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <Alert variant="default" className="border-orange-400/50 m-4">
                    <Info className="h-5 w-5 mr-2 text-orange-500"/>
                    <AlertTitle className="font-semibold text-orange-600">No Slots Available</AlertTitle>
                    <AlertDescription>
                      There are no time slots available for {format(selectedDate, 'PPP')}. Please try another date.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {!isLoading.availabilitySlots && !errors.availabilitySlots && selectedDate && dailySlots.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {dailySlots.map((slot) => (
                    <Button
                      key={slot.slotId}
                      variant={selectedTimeSlot?.slotId === slot.slotId ? "default" : "outline"}
                      onClick={() => handleTimeSlotSelect(slot)}
                      className="w-full"
                      disabled={isLoading.availabilitySlots} 
                    >
                      {format(parseISO(slot.startTime), 'p')}
                    </Button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6 mt-6">
        <Button variant="outline" onClick={goToPreviousStep} disabled={isLoading.availabilitySlots}>Back</Button>
        <Button onClick={goToNextStep} disabled={!selectedDate || !selectedTimeSlot || isLoading.availabilitySlots} size="lg">
          Next: Confirm Booking
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DateTimeSelectionStep; 