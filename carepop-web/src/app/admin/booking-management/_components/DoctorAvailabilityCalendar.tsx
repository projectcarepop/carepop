'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, startOfMonth, endOfMonth } from 'date-fns';

import { getCalculatedAvailability } from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DoctorAvailabilityCalendarProps {
    doctorId: string;
}

type AvailabilityData = {
    [date: string]: {
        status: 'available' | 'unavailable' | 'partial';
        slots: string[];
        reason?: string;
    }
}

export const DoctorAvailabilityCalendar: React.FC<DoctorAvailabilityCalendarProps> = ({ doctorId }) => {
    const [month, setMonth] = useState(new Date());
    const { session } = useAuth();
    const accessToken = session?.access_token;

    const firstDay = startOfMonth(month);
    const lastDay = endOfMonth(month);

    const { data: availability, isLoading, error } = useQuery<{data: AvailabilityData}>({
        queryKey: ['calculatedAvailability', doctorId, format(month, 'yyyy-MM')],
        queryFn: () => {
            if (!accessToken) throw new Error("Not authorized");
            return getCalculatedAvailability(
                doctorId,
                format(firstDay, 'yyyy-MM-dd'),
                format(lastDay, 'yyyy-MM-dd'),
                accessToken
            );
        },
        enabled: !!accessToken && !!doctorId,
        placeholderData: (prev) => prev,
    });
    
    const availabilityData = availability?.data || {};

    const renderDay = (day: Date) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayData = availabilityData[dateKey];
        
        let statusColor = 'bg-gray-100'; // Default for no data/unavailable
        if (dayData?.status === 'available') statusColor = 'bg-green-200';
        if (dayData?.status === 'partial') statusColor = 'bg-yellow-200';
        
        const content = (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex flex-col items-center justify-center h-full w-full">
                            <span>{format(day, 'd')}</span>
                            {dayData && (
                                <div className={`h-2 w-2 rounded-full mt-1 ${statusColor}`}></div>
                            )}
                        </div>
                    </TooltipTrigger>
                    {dayData && (
                        <TooltipContent>
                            <p className="font-bold">{dateKey}</p>
                            <p>Status: <span className="capitalize">{dayData.status}</span></p>
                            {dayData.slots.length > 0 && (
                                <div>
                                    <p>Slots:</p>
                                    <ul className="list-disc pl-4">
                                        {dayData.slots.map(slot => <li key={slot}>{slot}</li>)}
                                    </ul>
                                </div>
                            )}
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        );

        return content;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Availability Calendar</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading && <Skeleton className="w-full h-[300px]" />}
                {error && <p className="text-destructive">Failed to load calendar: {error.message}</p>}
                {!isLoading && !error && (
                    <DayPicker
                        month={month}
                        onMonthChange={setMonth}
                        showOutsideDays
                        fixedWeeks
                        components={{
                            Day: ({ day }) => renderDay(day.date)
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
}; 