'use client';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState } from 'react';
import { Calendar, dateFnsLocalizer, Event, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, add } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/lib/contexts/auth-context';
import { getClinicMasterSchedule, MasterScheduleAppointment, ClinicOverride, DoctorOverride } from '@/services/api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface ClinicMasterCalendarProps {
    clinicId: string;
}

interface CalendarEvent extends Event {
    type: 'appointment' | 'clinic_closure' | 'doctor_day_off';
    description?: string;
}

// --- Data Transformation Logic ---
const transformDataToEvents = (data: any): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // 1. Booked Appointments
    data.booked_appointments?.forEach((appt: MasterScheduleAppointment) => {
        const start = new Date(appt.appointmentTime);
        const end = add(start, { minutes: appt.service.durationMinutes });
        const patientName = `${appt.patient.firstName || ''} ${appt.patient.lastName || ''}`.trim();
        events.push({
            title: `${patientName} w/ Dr. ${appt.doctor.fullName}`,
            start,
            end,
            allDay: false,
            resource: { id: appt.id },
            type: 'appointment',
            description: `Service: ${appt.service.name}`,
        });
    });

    // 2. Clinic Overrides (Closures)
    data.clinic_overrides?.forEach((override: ClinicOverride) => {
        if (!override.isAvailable) { // Only show closures
            events.push({
                title: `Clinic Closed: ${override.reason || 'Special Event'}`,
                start: new Date(override.startDateTime),
                end: new Date(override.endDateTime),
                allDay: true, // Assuming closures are all-day events
                resource: { id: override.id },
                type: 'clinic_closure',
            });
        }
    });

    // 3. Doctor Overrides (Days Off)
    data.doctor_overrides?.forEach((override: DoctorOverride) => {
        if (!override.isAvailable) { // Only show unavailability
             events.push({
                title: `Doctor Day Off`, // In a real app, you'd fetch doctor's name
                start: new Date(override.startTime),
                end: new Date(override.endTime),
                allDay: true,
                resource: { id: override.id },
                type: 'doctor_day_off',
            });
        }
    });
    
    return events;
};

// Custom Event component with Tooltip
const CustomEvent = ({ event }: { event: CalendarEvent }) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="h-full w-full truncate">
                    {event.title}
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p className="font-bold">{event.title}</p>
                {event.description && <p>{event.description}</p>}
                {!event.allDay && event.start && event.end && (
                    <p className="text-sm text-muted-foreground">
                        {format(event.start, 'p')} - {format(event.end, 'p')}
                    </p>
                )}
            </TooltipContent>
        </Tooltip>
    );
};

export const ClinicMasterCalendar: React.FC<ClinicMasterCalendarProps> = ({ clinicId }) => {
    const { session } = useAuth();
    const accessToken = session?.access_token;
    const [view, setView] = useState<View>(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(date), 'yyyy-MM-dd');

    const { data: scheduleData, isLoading, isError, error } = useQuery({
        queryKey: ['clinicMasterSchedule', clinicId, startDate, endDate],
        queryFn: () => {
            if (!accessToken) throw new Error("Not authorized");
            return getClinicMasterSchedule(clinicId, startDate, endDate, accessToken);
        },
        enabled: !!accessToken && !!clinicId,
    });

    const events = scheduleData ? transformDataToEvents(scheduleData) : [];

    const eventPropGetter = (event: CalendarEvent) => {
        const style: React.CSSProperties = {};
        switch (event.type) {
            case 'appointment':
                style.backgroundColor = 'hsl(var(--primary))';
                style.color = 'hsl(var(--primary-foreground))';
                break;
            case 'clinic_closure':
                style.backgroundColor = 'hsl(var(--destructive))';
                style.color = 'hsl(var(--destructive-foreground))';
                break;
            case 'doctor_day_off':
                 style.backgroundColor = 'hsl(var(--muted))';
                 style.color = 'hsl(var(--muted-foreground))';
                 style.border = '1px solid hsl(var(--border))';
                break;
        }
        return { style };
    };

    if (isLoading) {
        return <Skeleton className="h-[80vh] w-full" />;
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error instanceof Error ? error.message : "An unknown error occurred while fetching the schedule."}
                </AlertDescription>
            </Alert>
        );
    }
    
    return (
        <TooltipProvider>
            <div style={{ height: '80vh' }}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    view={view}
                    date={date}
                    onView={setView}
                    onNavigate={setDate}
                    eventPropGetter={eventPropGetter}
                    components={{
                        event: CustomEvent,
                    }}
                />
            </div>
        </TooltipProvider>
    );
}; 