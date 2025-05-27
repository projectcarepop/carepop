'use client';

import React from 'react';
import { useBookingContext } from '@/lib/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
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
      // API Call: POST /api/appointments (Backend Integration Guide - Section 4.1)
      const response = await fetch('/api/v1/appointments', {
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
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Step 4: Confirm Booking</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="default">
                    <AlertTitle>Missing Information</AlertTitle>
                    <AlertDescription>
                        Please complete all previous steps before confirming your booking.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter className="flex justify-start">
                <Button variant="outline" onClick={goToPreviousStep}>Back to Date & Time</Button>
            </CardFooter>
        </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Step 4: Confirm Your Booking</CardTitle>
        <CardDescription>
          Please review your appointment details below and confirm.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 rounded-md border p-4 shadow-sm">
          <h4 className="text-lg font-medium text-primary">Appointment Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div><strong>Clinic:</strong> {selectedClinic.name}</div>
            <div><strong>Service:</strong> {selectedService.name}</div>
            <div><strong>Provider:</strong> {selectedProvider.fullName}</div>
            <div><strong>Date:</strong> {format(selectedDate, 'PPP')}</div>
            <div><strong>Time:</strong> {format(parseISO(selectedTimeSlot.startTime), 'p')} - {format(parseISO(selectedTimeSlot.endTime), 'p')}</div>
            {selectedService.typicalDurationMinutes && <div><strong>Duration:</strong> {selectedService.typicalDurationMinutes} minutes</div>}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="booking-notes" className="block text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
          <Textarea 
            id="booking-notes"
            placeholder="Any specific requests or information for the provider..."
            value={bookingNotes}
            onChange={handleNotesChange}
            className="min-h-[100px]"
            disabled={isLoading.bookingSubmission}
          />
        </div>

        {errors.bookingSubmission && (
            <Alert variant="destructive">
                <AlertTitle>Booking Failed</AlertTitle>
                <AlertDescription>{errors.bookingSubmission}</AlertDescription>
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