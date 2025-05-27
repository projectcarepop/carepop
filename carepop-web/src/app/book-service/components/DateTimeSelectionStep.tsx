'use client';

import React, { useEffect, useState } from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { AvailabilitySlot } from '@/lib/types/booking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar"; // Assuming Shadcn UI Calendar
import { Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isSameDay, parseISO, getMonth, getYear } from 'date-fns';

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
      fetch(`/api/v1/availability/provider/${selectedProvider.id}/slots?${queryParams}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (data.success) {
            dispatch({ type: 'SET_AVAILABILITY_SUCCESS', payload: data.data as AvailabilitySlot[] });
          } else {
            dispatch({ type: 'SET_AVAILABILITY_ERROR', payload: data.message || 'Failed to fetch availability.' });
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
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Step 3: Select Date & Time</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="default">
                    <AlertTitle>Missing Information</AlertTitle>
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Step 3: Select Date & Time</CardTitle>
        <CardDescription>
          Pick a date and time for your appointment with {selectedProvider.fullName} for {selectedService.name}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar View */}
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-medium mb-2">Select a Date</h4>
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth} // Handles month navigation in calendar
              disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } // Disable past dates
              className="rounded-md border shadow-sm p-3"
              modifiers={modifiers}
              modifiersClassNames={modifiersClassNames}
              footer={
                selectedDate && <p className="text-sm mt-2">You selected: {format(selectedDate, 'PPP')}.</p>
              }
            />
          </div>

          {/* Time Slots View */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Available Times on {selectedDate ? format(selectedDate, 'PPP') : 'selected date'}</h4>
            {isLoading.availabilitySlots && <div className="flex items-center space-x-2"><Loader2 className="h-5 w-5 animate-spin" /> <span>Loading time slots...</span></div>}
            {errors.availabilitySlots && <Alert variant="destructive"><AlertTitle>Error Loading Slots</AlertTitle><AlertDescription>{errors.availabilitySlots}</AlertDescription></Alert>}
            
            {!isLoading.availabilitySlots && !errors.availabilitySlots && !selectedDate && (
              <Alert variant="default">
                <AlertDescription>Please select a date from the calendar to see available time slots.</AlertDescription>
              </Alert>
            )}

            {!isLoading.availabilitySlots && selectedDate && dailySlots.length === 0 && !errors.availabilitySlots && (
              <Alert variant="default">
                <AlertTitle>No Slots Available</AlertTitle>
                <AlertDescription>There are no available time slots for {selectedProvider.fullName} on {format(selectedDate, 'PPP')}. Please try another date.</AlertDescription>
              </Alert>
            )}

            {!isLoading.availabilitySlots && dailySlots.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-2">
                {dailySlots.map((slot) => (
                  <Button 
                    key={slot.slotId}
                    variant={selectedTimeSlot?.slotId === slot.slotId ? "default" : "outline"}
                    onClick={() => handleTimeSlotSelect(slot)}
                    className="w-full py-3 text-sm focus:ring-2 focus:ring-primary"
                  >
                    {format(parseISO(slot.startTime), 'p')} - {format(parseISO(slot.endTime), 'p')}
                  </Button>
                ))}
              </div>
            )}
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