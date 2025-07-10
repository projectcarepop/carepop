'use client';

import React, { useState, useEffect } from 'react';
import type { BookingData } from './BookingFlowManager';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, differenceInMinutes } from 'date-fns';
import { Loader2, Home, Stethoscope, User, CalendarDays, AlertTriangle, Clock } from 'lucide-react';
import { useAuth } from '@/lib/contexts/auth-context';

// Helper to format the address
function formatAddress(address: any): string {
    if (!address) return '';
    if (typeof address === 'string') return address;
    
    const parts = [
        address.street,
        address.city,
        address.province,
        address.zip,
    ].filter(Boolean); // Filter out any null/undefined parts
    
    return parts.join(', ');
}

interface Step4_ConfirmationProps {
  bookingData: BookingData;
  confirmBooking: () => void; 
  isBooking: boolean;
}

export const Step4_Confirmation: React.FC<Step4_ConfirmationProps> = ({
  bookingData,
  confirmBooking,
  isBooking,
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ available: boolean; message?: string } | null>(null);
  const { session } = useAuth();

  // Validate slot availability when component mounts or slot changes
  useEffect(() => {
    const validateSlot = async () => {
      if (!bookingData.slot || !bookingData.doctor || !bookingData.service || !bookingData.clinic || !session?.access_token) {
        return;
      }

      setIsValidating(true);
      try {
        const { validateSlotAvailability } = await import('@/services/api');
        const result = await validateSlotAvailability(
          bookingData.doctor.id,
          bookingData.service.id,
          bookingData.clinic.id,
          bookingData.slot.toISOString(),
          session.access_token
        );
        setValidationResult(result);
      } catch {
        setValidationResult({ 
          available: false, 
          message: 'Unable to verify slot availability. Please proceed with caution.' 
        });
      }
      setIsValidating(false);
    };

    validateSlot();
  }, [bookingData.slot, bookingData.doctor, bookingData.service, bookingData.clinic, session?.access_token]);

  // Calculate how recent the appointment time is
  const appointmentTimeWarning = bookingData.slot ? (() => {
    const now = new Date();
    const appointmentTime = bookingData.slot;
    const minutesUntil = differenceInMinutes(appointmentTime, now);
    
    if (minutesUntil < 60) {
      return 'This appointment is scheduled for less than 1 hour from now.';
    } else if (minutesUntil < 24 * 60) {
      return 'This appointment is scheduled for today.';
    }
    return null;
  })() : null;

  const handleConfirmBooking = () => {
    // Show validation warning if slot appears unavailable
    if (validationResult && !validationResult.available) {
      const confirmAnyway = confirm(
        `Warning: ${validationResult.message}\n\nDo you want to try booking anyway? The system will attempt to reserve this slot, but it may fail if another user has already booked it.`
      );
      if (!confirmAnyway) {
        return;
      }
    }
    
    confirmBooking();
  };

  return (
    <Card className="relative">
      {isBooking && (
        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-lg z-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg font-semibold">Confirming your booking...</p>
          <p className="text-sm text-muted-foreground mt-1">Validating slot availability...</p>
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Confirm Your Appointment</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm pt-1">
          Please review the details of your appointment below before confirming.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Slot validation status */}
        {isValidating && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Checking slot availability...
            </AlertDescription>
          </Alert>
        )}
        
        {validationResult && !validationResult.available && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Warning:</strong> {validationResult.message} The booking will be attempted but may fail.
            </AlertDescription>
          </Alert>
        )}

        {validationResult && validationResult.available && (
          <Alert className="border-green-200 bg-green-50">
            <CalendarDays className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✓ Time slot is currently available
            </AlertDescription>
          </Alert>
        )}

        {/* Appointment timing warning */}
        {appointmentTimeWarning && (
          <Alert className="border-amber-200 bg-amber-50">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Note:</strong> {appointmentTimeWarning} Please ensure you can arrive on time.
            </AlertDescription>
          </Alert>
        )}

        <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-lg">Appointment Details</h3>
            <ul className="mt-2 space-y-4 text-sm">
                <li className="flex items-start gap-3">
                    <Home className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                        <span className="font-semibold">{bookingData.clinic?.name || 'Not Selected'}</span>
                        <p className="text-muted-foreground text-xs">{formatAddress((bookingData.clinic as any)?.address)}</p>
                    </div>
                </li>
                <li className="flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 text-muted-foreground" />
                    <div>
                        <span className="font-semibold">{bookingData.service?.name || 'Not Selected'}</span>
                        {bookingData.service && (
                            <span className="text-xs text-muted-foreground ml-1.5">
                                ({bookingData.service.durationMinutes} minutes)
                            </span>
                        )}
                    </div>
                </li>
                <li className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">{bookingData.doctor?.fullName || 'Not Selected'}</span>
                </li>
                <li className="flex items-center gap-3">
                    <CalendarDays className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">
                        {bookingData.slot ? format(bookingData.slot, "MMMM d, yyyy 'at' h:mm a") : 'Not Selected'}
                    </span>
                </li>
            </ul>
        </div>
        <div className="p-4 border-t border-dashed">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Service Fee</dt>
                <dd className="font-semibold">
                  {bookingData.service ? 
                    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(bookingData.service.price) 
                    : 'N/A'}
                </dd>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <dt>Total</dt>
                <dd>
                  {bookingData.service ? 
                    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(bookingData.service.price) 
                    : 'N/A'}
                </dd>
              </div>
            </dl>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleConfirmBooking}
          disabled={!bookingData.clinic || !bookingData.service || !bookingData.doctor || !bookingData.slot || isBooking || isValidating}
        >
          {isBooking ? 'Booking...' : isValidating ? 'Validating...' : 'Confirm Booking'}
        </Button>
      </CardFooter>
    </Card>
  );
}; 