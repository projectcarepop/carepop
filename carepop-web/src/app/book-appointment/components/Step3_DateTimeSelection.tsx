'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAvailableSlots, getAvailableDays } from '../../../services/api';
import { format, startOfDay, addDays, getYear, getMonth, parse } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  const queryClient = useQueryClient();

  // Auto-refresh slots every 30 seconds when component is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedDate && bookingData.doctor?.id) {
        queryClient.invalidateQueries({ 
          queryKey: ['availableSlots', bookingData.doctor.id, bookingData.clinic?.id, selectedDate] 
        });
        setLastRefresh(new Date());
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [selectedDate, bookingData.doctor?.id, bookingData.clinic?.id, queryClient]);

  const { data: availableDays, isLoading: isLoadingDays } = useQuery({
    queryKey: ['availableDays', bookingData.doctor?.id, bookingData.clinic?.id, getMonth(currentMonth) + 1, getYear(currentMonth), refreshKey],
    queryFn: () => getAvailableDays(
      bookingData.doctor!.id,
      bookingData.service!.id,
      bookingData.clinic!.id,
      getMonth(currentMonth) + 1, // getMonth is 0-indexed
      getYear(currentMonth)
    ),
    enabled: !!bookingData.doctor?.id && !!bookingData.service?.id && !!bookingData.clinic?.id,
    refetchInterval: 60000, // Refetch available days every minute
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
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['availableSlots', bookingData.doctor?.id, bookingData.clinic?.id, selectedDate, refreshKey],
    queryFn: () => getAvailableSlots(
      bookingData.doctor!.id,
      bookingData.service!.id,
      bookingData.clinic!.id,
      format(selectedDate!, 'yyyy-MM-dd')
    ),
    enabled: !!bookingData.doctor?.id && !!bookingData.service?.id && !!bookingData.clinic?.id && !!selectedDate,
    refetchInterval: 30000, // Refetch available slots every 30 seconds
  });

  const handleSelectSlot = (slot: Date) => {
    updateBookingData({ slot });
    setSelectionMade(true);
  };

  const handleRefreshSlots = () => {
    setRefreshKey(prev => prev + 1);
    setLastRefresh(new Date());
    queryClient.invalidateQueries({ 
      queryKey: ['availableSlots', bookingData.doctor?.id, bookingData.clinic?.id, selectedDate] 
    });
  };

  // Check if selected slot is still available in current data
  const isSelectedSlotStillAvailable = useMemo(() => {
    if (!bookingData.slot || !availableSlots) return true;
    return availableSlots.includes(bookingData.slot.toISOString());
  }, [bookingData.slot, availableSlots]);

  // Show warning if selected slot is no longer available
  useEffect(() => {
    if (bookingData.slot && availableSlots && !isSelectedSlotStillAvailable) {
      // Clear the invalid selection
      updateBookingData({ slot: undefined });
      setSelectionMade(false);
    }
  }, [isSelectedSlotStillAvailable, bookingData.slot, availableSlots, updateBookingData, setSelectionMade]);

  const timeSinceLastUpdate = Math.floor((Date.now() - dataUpdatedAt) / 1000);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>Select a Date & Time</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshSlots}
                disabled={isLoadingSlots}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${isLoadingSlots ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
        </div>
        {timeSinceLastUpdate > 60 && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Slot information is {Math.floor(timeSinceLastUpdate / 60)} minute{Math.floor(timeSinceLastUpdate / 60) !== 1 ? 's' : ''} old. 
              Consider refreshing for the latest availability.
            </AlertDescription>
          </Alert>
        )}
        {bookingData.slot && !isSelectedSlotStillAvailable && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Your previously selected time slot is no longer available. Please select a new time.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row gap-2">
        <div className="w-auto">
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
            className="rounded-md border"
          />
        </div>
        <div className="relative flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-lg">Time</h3>
            <span className="text-xs text-muted-foreground">
              Updated {format(lastRefresh, 'h:mm a')}
            </span>
          </div>
          {(isLoadingSlots || isLoadingDays) && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          {isError && (
            <Alert className="border-red-200 bg-red-50 mb-4">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Could not load slots. Please try refreshing or select another day.
              </AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto pr-2">
            {selectedDate && availableSlots && availableSlots.length > 0 ? (
              availableSlots.map((slot: string) => {
                const isSelected = bookingData.slot?.toISOString() === slot;
                return (
                  <Button 
                    key={slot} 
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => handleSelectSlot(new Date(slot))}
                    className="flex items-center justify-center gap-1 text-xs"
                  >
                    <Clock className="w-3 h-3" />
                    {formatInTimeZone(new Date(slot), 'Asia/Manila', 'h:mm a')}
                  </Button>
                );
              })
            ) : (
              <div className="col-span-3 md:col-span-4 text-center text-muted-foreground pt-8">
                {isLoadingDays || isLoadingSlots ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                ) : selectedDate ? (
                  <div>
                    <p className="mb-2">No available slots for this day.</p>
                    <Button variant="outline" size="sm" onClick={handleRefreshSlots}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Check Again
                    </Button>
                  </div>
                ) : (
                  "Please select an available date."
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
