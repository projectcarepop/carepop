'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAvailableSlots, getAvailableDays } from '../../../services/api';
import { format, startOfDay, addDays, getYear, getMonth, parse } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Loader2, Clock } from 'lucide-react';
import type { BookingData } from './BookingFlowManager';

interface Step3_DateTimeSelectionProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  setSelectionMade: (isSelected: boolean) => void;
}

export const Step3_DateTimeSelection: React.FC<Step3_DateTimeSelectionProps> = ({
  bookingData,
  updateBookingData,
  setSelectionMade,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    bookingData.slot ? bookingData.slot : addDays(new Date(), 1)
  );
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: availableDays, isLoading: isLoadingDays } = useQuery({
    queryKey: ['availableDays', bookingData.doctor?.id, bookingData.clinic?.id, getMonth(currentMonth) + 1, getYear(currentMonth)],
    queryFn: () => getAvailableDays(
      bookingData.doctor!.id,
      bookingData.service!.id,
      bookingData.clinic!.id,
      getMonth(currentMonth) + 1, // getMonth is 0-indexed
      getYear(currentMonth)
    ),
    enabled: !!bookingData.doctor?.id && !!bookingData.service?.id && !!bookingData.clinic?.id,
  });
  
  // Memoize the conversion of string dates to Date objects for the modifiers
  const availableDaysAsDates = useMemo(() => {
    if (!availableDays) return [];
    return availableDays.map((dateStr: string) => parse(dateStr, 'yyyy-MM-dd', new Date()));
  }, [availableDays]);

  const {
    data: availableSlots,
    isLoading: isLoadingSlots,
    isError,
  } = useQuery({
    queryKey: ['availableSlots', bookingData.doctor?.id, bookingData.clinic?.id, selectedDate],
    queryFn: () => getAvailableSlots(
      bookingData.doctor!.id,
      bookingData.service!.id,
      bookingData.clinic!.id,
      format(selectedDate!, 'yyyy-MM-dd')
    ),
    enabled: !!bookingData.doctor?.id && !!bookingData.service?.id && !!bookingData.clinic?.id && !!selectedDate,
  });

  const handleSelectSlot = (slot: Date) => {
    updateBookingData({ slot });
    setSelectionMade(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>Select a Date & Time</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-lg mb-3">Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            disabled={(date) => date <= startOfDay(new Date())}
            modifiers={{ available: availableDaysAsDates }}
            modifiersClassNames={{ available: 'day-available' }}
            formatters={{
              formatDay: (day) => {
                const isAvailable = availableDaysAsDates.some(
                  (d: Date) => d.getDate() === day.getDate() && d.getMonth() === day.getMonth() && d.getFullYear() === day.getFullYear()
                );
                return `${day.getDate()}${isAvailable ? ', Available' : ''}`;
              }
            }}
            className="rounded-md border"
          />
        </div>
        <div className="relative">
          <h3 className="font-semibold text-lg mb-3">Time</h3>
          {(isLoadingSlots || isLoadingDays) && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {isError && <p className="text-destructive">Could not load slots. Please try another day.</p>}
          <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-2">
            {selectedDate && availableSlots && availableSlots.length > 0 ? (
              availableSlots.map((slot: string) => ( // Slots are now strings from API
                <Button 
                  key={slot} 
                  variant={bookingData.slot?.toISOString() === slot ? 'default' : 'outline'}
                  onClick={() => handleSelectSlot(new Date(slot))}
                  className="flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  {formatInTimeZone(new Date(slot), 'Asia/Manila', 'h:mm a')}
                </Button>
              ))
            ) : (
              <p className="col-span-3 text-center text-muted-foreground pt-8">
                {isLoadingDays || isLoadingSlots ? 'Loading...' : (selectedDate ? "No available slots for this day." : "Please select an available date.")}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
