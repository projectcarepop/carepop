'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAvailableSlots } from '@/services/api';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { isSameDay, startOfMonth, endOfMonth, format } from 'date-fns';

import type { BookingData } from './BookingFlowManager';

interface Step3_DateTimeSelectionProps {
    bookingData: BookingData;
    onDateTimeSelect: (dateTime: Date) => void;
}

export function Step3_DateTimeSelection({ bookingData, onDateTimeSelect }: Step3_DateTimeSelectionProps) {
    const [selectedDay, setSelectedDay] = useState<Date | undefined>();
    const [displayMonth, setDisplayMonth] = useState(new Date());

    const queryRange = useMemo(() => {
        const start = startOfMonth(displayMonth);
        const end = endOfMonth(displayMonth);
        return { start, end };
    }, [displayMonth]);

    const { data: availableSlots, isLoading, isError } = useQuery<string[], Error>({
        queryKey: ['availableSlots', bookingData.doctor?.id, bookingData.clinic?.id, queryRange.start, queryRange.end],
        queryFn: () => getAvailableSlots(
            bookingData.doctor!.id,
            bookingData.service!.id,
            bookingData.clinic!.id,
            queryRange.start!.toISOString(),
            queryRange.end!.toISOString()
        ),
        enabled: !!bookingData.doctor?.id && !!bookingData.service?.id && !!bookingData.clinic?.id,
    });

    const slotsForSelectedDay = useMemo(() => {
        if (!selectedDay || !availableSlots) return [];
        return availableSlots.filter(slot => isSameDay(new Date(slot), selectedDay));
    }, [selectedDay, availableSlots]);

    const isDayDisabled = (day: Date) => {
        if (!availableSlots && isLoading) return true; 
        if (!availableSlots) return false;
        const slotsForDay = availableSlots.filter(slot => isSameDay(new Date(slot), day));
        return slotsForDay.length === 0;
    };
    
    useEffect(() => {
        if (selectedDay) {
            const slots = availableSlots?.filter(slot => isSameDay(new Date(slot), selectedDay)) ?? [];
            if (slots.length === 0) {
                setSelectedDay(undefined);
            }
        }
    }, [availableSlots, selectedDay]);

    const handleMonthChange = (month: Date) => {
        setDisplayMonth(month);
        setSelectedDay(undefined); 
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-lg font-semibold text-center mb-4">Select a Date</h3>
                <div className="flex justify-center">
                    <DayPicker
                      mode="single"
                      selected={selectedDay}
                      onSelect={setSelectedDay}
                      onMonthChange={handleMonthChange}
                      month={displayMonth}
                      disabled={[
                        { before: new Date() },
                        isDayDisabled
                      ]}
                      className="rounded-md border"
                      classNames={{
                        day_disabled: "text-muted-foreground opacity-50 line-through",
                      }}
                    />
                </div>
            </div>
            <div className="flex flex-col">
                <h3 className="text-lg font-semibold text-center mb-4">Select a Time</h3>
                {isLoading && (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                )}
                {isError && (
                     <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>Could not load available times.</AlertDescription>
                    </Alert>
                )}
                {!isLoading && !isError && selectedDay && (
                    <div className="grid grid-cols-3 gap-2 flex-grow content-start">
                        {slotsForSelectedDay.length > 0 ? (
                            slotsForSelectedDay.map((slot) => (
                                <Button
                                    key={slot}
                                    variant="outline"
                                    onClick={() => onDateTimeSelect(new Date(slot))}
                                >
                                    {format(new Date(slot), 'h:mm a')}
                                </Button>
                            ))
                        ) : (
                            <p className="col-span-3 text-center text-muted-foreground">No available slots for this day.</p>
                        )}
                    </div>
                )}
                {!isLoading && !isError && !selectedDay && (
                    <div className="flex justify-center items-center h-full">
                        <p className="text-muted-foreground">Please select a date to see available times.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
