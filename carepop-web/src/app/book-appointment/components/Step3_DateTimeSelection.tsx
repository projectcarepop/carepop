'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAvailableSlots } from '../../../services/api';
import { format, startOfMonth, endOfMonth, startOfDay, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { BookingData } from './BookingFlowManager';

interface Step3_DateTimeSelectionProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

export const Step3_DateTimeSelection: React.FC<Step3_DateTimeSelectionProps> = ({
  bookingData,
  updateBookingData,
  goToNextStep,
  goToPreviousStep,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 1));
  
  const queryRange = useMemo(() => {
    if (!selectedDate) return { start: null, end: null };
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return { start, end };
  }, [selectedDate]);

  const {
    data: availableSlots,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['availableSlots', bookingData.doctor?.id, bookingData.clinic?.id, queryRange.start, queryRange.end],
    queryFn: () => getAvailableSlots(
      bookingData.doctor!.id,
      bookingData.service!.id,
      bookingData.clinic!.id,
      queryRange.start!.toISOString(),
      queryRange.end!.toISOString()
    ),
    enabled: !!bookingData.doctor?.id && !!bookingData.service?.id && !!bookingData.clinic?.id && !!queryRange.start,
  });

  const slotsForSelectedDay = useMemo(() => {
    if (!selectedDate || !availableSlots) return [];
    const dayStart = startOfDay(selectedDate);
    // The service returns ISO strings, so we need to convert them to Date objects
    const slotsAsDates = availableSlots.map((slot: string) => new Date(slot));
    return slotsAsDates.filter((slot: Date) => startOfDay(slot).getTime() === dayStart.getTime());
  }, [selectedDate, availableSlots]);

  const handleSelectSlot = (slot: Date) => {
    updateBookingData({ slot });
    goToNextStep();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>Select a Date & Time</CardTitle>
            <Button variant="ghost" onClick={goToPreviousStep}>Back</Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date <= new Date()}
            className="rounded-md border"
          />
        </div>
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {isError && <p className="text-destructive">Could not load slots. Please try another month.</p>}
          <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
            {slotsForSelectedDay.length > 0 ? (
              slotsForSelectedDay.map((slot: Date) => (
                <Button key={slot.toISOString()} onClick={() => handleSelectSlot(slot)}>
                  {format(slot, 'h:mm a')}
                </Button>
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground pt-8">
                {selectedDate ? "No available slots for this day." : "Please select a date."}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
