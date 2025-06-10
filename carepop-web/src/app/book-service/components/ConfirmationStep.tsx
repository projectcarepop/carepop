'use client';

import React from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Info, CheckSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const ConfirmationStep: React.FC = () => {
  const { state, dispatch } = useBookingContext();
  const { 
    selectedClinic,
    selectedService,
    selectedProvider,
    selectedDate,
    selectedTimeSlot,
    bookingNotes,
    isLoading,
    errors 
  } = state;

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: 'SET_BOOKING_NOTES', payload: event.target.value });
  };

  const handleSubmitBooking = async () => {
    if (!selectedClinic || !selectedService || !selectedProvider || !selectedDate || !selectedTimeSlot) {
      // This should ideally not happen if navigation is controlled properly
      dispatch({ type: 'SET_BOOKING_SUBMISSION_ERROR', payload: 'Missing booking information. Please review previous steps.' });
      return;
    }

    dispatch({ type: 'SET_BOOKING_SUBMISSION_LOADING', payload: true });

    const supabase = createSupabaseBrowserClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      console.error("Error getting session or no session:", sessionError);
      dispatch({ type: 'SET_BOOKING_SUBMISSION_ERROR', payload: 'Your session is invalid. Please log in again.' });
      dispatch({ type: 'SET_BOOKING_SUBMISSION_LOADING', payload: false });
      return;
    }
    const token = sessionData.session.access_token;

    const bookingData = {
      clinicId: selectedClinic.id,
      serviceId: selectedService.id,
      providerId: selectedProvider.id,
      startTime: selectedTimeSlot.startTime, // Already in ISO format from backend
      endTime: selectedTimeSlot.endTime,     // Already in ISO format from backend
      notes: bookingNotes,
    };

    try {
      // API Call: POST /api/v1/admin/appointments (Backend Integration Guide - Section 4.1)
      const response = await fetch('/api/v1/admin/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        dispatch({ type: 'SET_BOOKING_SUBMISSION_SUCCESS', payload: result.data });
        dispatch({ type: 'SET_CURRENT_STEP', payload: 5 }); // Move to a success/summary step
      } else {
        dispatch({ type: 'SET_BOOKING_SUBMISSION_ERROR', payload: result.message || 'Failed to submit booking.' });
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      dispatch({ type: 'SET_BOOKING_SUBMISSION_ERROR', payload: errorMessage });
    }
  };

  const goToPreviousStep = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
  };

  if (!selectedClinic || !selectedService || !selectedProvider || !selectedDate || !selectedTimeSlot) {
    return (
        <Card className="w-full shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Step 4: Confirm Booking</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="default" className="border-primary/50">
                    <Info className="h-5 w-5 mr-2 text-primary"/>
                    <AlertTitle className="font-semibold text-primary">Missing Information</AlertTitle>
                    <AlertDescription>
                        Please complete all previous steps before confirming your booking.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter className="flex justify-start border-t pt-6 mt-6">
                <Button variant="outline" onClick={goToPreviousStep}>Back to Date & Time</Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center">
            <CheckSquare className="mr-3 h-8 w-8 text-primary"/> Step 4: Confirm Your Booking
        </CardTitle>
        <CardDescription className="text-md pl-11">
          Please review your appointment details below and confirm.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        <div className="space-y-3 rounded-lg border-2 border-primary/30 p-5 shadow-md bg-gradient-to-br from-primary/5 via-background to-background">
          <h4 className="text-xl font-semibold text-primary mb-3">Appointment Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div className="flex flex-col space-y-0.5">
              <span className="text-xs text-muted-foreground">Clinic:</span>
              <strong className="text-md">{selectedClinic.name}</strong>
            </div>
            <div className="flex flex-col space-y-0.5">
              <span className="text-xs text-muted-foreground">Service:</span>
              <strong className="text-md">{selectedService.name}</strong>
            </div>
            <div className="flex flex-col space-y-0.5">
              <span className="text-xs text-muted-foreground">Provider:</span>
              <strong className="text-md">{selectedProvider.fullName}</strong>
            </div>
            <div className="flex flex-col space-y-0.5">
              <span className="text-xs text-muted-foreground">Date:</span>
              <strong className="text-md">{format(selectedDate, 'PPP')}</strong>
            </div>
            <div className="flex flex-col space-y-0.5 md:col-span-2">
              <span className="text-xs text-muted-foreground">Time:</span>
              <strong className="text-md">{format(parseISO(selectedTimeSlot.startTime), 'p')} - {format(parseISO(selectedTimeSlot.endTime), 'p')}</strong>
            </div>
            {selectedService.typicalDurationMinutes && 
              <div className="flex flex-col space-y-0.5">
                <span className="text-xs text-muted-foreground">Duration:</span>
                <strong className="text-md">{selectedService.typicalDurationMinutes} minutes</strong>
              </div>
            }
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <label htmlFor="booking-notes" className="block text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
          <Textarea 
            id="booking-notes"
            placeholder="Any specific requests or information for the provider..."
            value={bookingNotes}
            onChange={handleNotesChange}
            className="min-h-[100px] focus:ring-primary focus:border-primary rounded-md shadow-sm"
            disabled={isLoading.bookingSubmission}
          />
        </div>

        {errors.bookingSubmission && (
          <Alert variant="destructive" className="mt-4">
            <Info className="h-5 w-5 mr-2"/>
            <AlertTitle>Booking Failed</AlertTitle>
            <AlertDescription>
              {errors.bookingSubmission}
              <Button
                onClick={handleSubmitBooking}
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
                disabled={isLoading.bookingSubmission}
              >
                {isLoading.bookingSubmission && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Try to Book Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6 mt-6">
        <Button variant="outline" onClick={goToPreviousStep} disabled={isLoading.bookingSubmission}>Back</Button>
        <Button onClick={handleSubmitBooking} disabled={isLoading.bookingSubmission} size="lg">
          {isLoading.bookingSubmission ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
          ) : 'Confirm & Book Appointment'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConfirmationStep; 