'use client';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useActionState, useEffect, useState } from "react";
import { createAppointment } from "@/lib/actions/appointment.actions";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { Loader2, CalendarIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from '@/components/ui/combobox';
import useSWR from 'swr';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker } from '@/components/ui/time-picker';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Service {
  value: string;
  label: string;
  duration: number | null;
}

const formSchema = z.object({
  patientId: z.string().uuid("Please select a patient."),
  clinicId: z.string().uuid("Please select a clinic."),
  serviceId: z.string().uuid("Please select a service."),
  providerId: z.string().uuid("Please select a provider."),
  appointmentDateTime: z.date({
    required_error: "An appointment date and time is required.",
  }),
  duration: z.string().refine(val => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, {
    message: "Duration must be a positive number.",
  }),
  notes: z.string().optional(),
});

type NewAppointmentFormValues = z.infer<typeof formSchema>;

interface NewAppointmentFormProps {
    clinics: { id: string, name: string }[];
    patients: { id: string, full_name: string }[];
}

export function NewAppointmentForm({ clinics, patients }: NewAppointmentFormProps) {
    const { toast } = useToast();
    const [state, formAction, isPending] = useActionState(createAppointment, null);
    
    const form = useForm<NewAppointmentFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            patientId: "",
            clinicId: "",
            serviceId: "",
            providerId: "",
            appointmentDateTime: undefined,
            duration: "30",
            notes: "",
        },
    });

    const selectedClinicId = form.watch('clinicId');
    const selectedProviderId = form.watch('providerId');
    const selectedDate = form.watch('appointmentDateTime');

    const { data: services, isLoading: isLoadingServices } = useSWR<Service[]>(
        selectedClinicId ? `/api/admin/clinics/${selectedClinicId}/services` : null, 
        fetcher
    );

    const { data: providers, isLoading: isLoadingProviders } = useSWR(
        selectedClinicId ? `/api/admin/clinics/${selectedClinicId}/providers` : null,
        fetcher
    );

    const [bookedSlots, setBookedSlots] = useState<{ startTime: string; endTime: string }[]>([]);
    const [isLoadingBookedSlots, setIsLoadingBookedSlots] = useState(false);

    useEffect(() => {
        if (state?.message) {
            if (state.errors) {
                toast({
                    title: "Error",
                    description: state.message,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: state.message,
                });
                form.reset();
            }
        }
    }, [state, toast, form]);
    
    useEffect(() => {
        if (selectedProviderId && selectedDate) {
          const fetchBookedSlots = async () => {
            setIsLoadingBookedSlots(true);
            try {
              const date = new Date(selectedDate).toISOString().split('T')[0];
              const duration = form.getValues('duration');
              const response = await fetch(`/api/admin/providers/${selectedProviderId}/booked-slots?date=${date}&duration=${duration}`);
              if (response.ok) {
                const data = await response.json();
                setBookedSlots(data);
              } else {
                setBookedSlots([]);
              }
            } catch (error) {
              console.error('Error fetching booked slots:', error);
              setBookedSlots([]);
            } finally {
              setIsLoadingBookedSlots(false);
            }
          };
          fetchBookedSlots();
        } else {
          setBookedSlots([]);
        }
    }, [selectedProviderId, selectedDate, form.watch('duration'), form]);

    const handleClinicChange = (clinicId: string) => {
        form.setValue('clinicId', clinicId);
        form.setValue('serviceId', '');
        form.setValue('providerId', '');
    }

    const isTimeBlocked = (time: Date) => {
        const duration = form.getValues('duration') ? parseInt(form.getValues('duration'), 10) : 30;
        if (isNaN(duration)) return false; 
        const newApptStartTime = time.getTime();
        const newApptEndTime = newApptStartTime + duration * 60000;
        for (const slot of bookedSlots) {
          const existingApptStartTime = new Date(slot.startTime).getTime();
          const existingApptEndTime = new Date(slot.endTime).getTime();
          if (newApptStartTime < existingApptEndTime && newApptEndTime > existingApptStartTime) {
            return true;
          }
        }
        return false;
    };
    
    const patientOptions = patients.map(p => ({ value: p.id, label: p.full_name }));
    const clinicOptions = clinics.map(c => ({ value: c.id, label: c.name }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
                <CardDescription>Fill out the form to schedule a new appointment.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form action={formAction} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="patientId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Patient</FormLabel>
                                <FormControl>
                                    <Combobox
                                    options={patientOptions}
                                    {...field}
                                    placeholder="Select a patient..."
                                    searchPlaceholder="Search patients by name or email..."
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="clinicId"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Clinic</FormLabel>
                                <Combobox
                                    options={clinicOptions}
                                    value={field.value}
                                    onChange={(value) => {
                                        field.onChange(value);
                                        handleClinicChange(value);
                                    }}
                                    placeholder="Select a clinic location"
                                    searchPlaceholder="Search clinics..."
                                    emptyText="No clinics found."
                                />
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="serviceId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Service</FormLabel>
                                <FormControl>
                                    <Combobox
                                    options={services || []}
                                    {...field}
                                    onChange={(value: string) => {
                                        form.setValue('serviceId', value, { shouldValidate: true });
                                        const selectedService = services?.find((s: Service) => s.value === value);
                                        if (selectedService && selectedService.duration) {
                                            form.setValue('duration', selectedService.duration.toString(), { shouldValidate: true });
                                        }
                                    }}
                                    placeholder={isLoadingServices ? "Loading..." : "Select a service..."}
                                    searchPlaceholder="Search services..."
                                    disabled={!selectedClinicId || isLoadingServices}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="providerId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Provider</FormLabel>
                                <FormControl>
                                    <Combobox
                                    options={providers || []}
                                    {...field}
                                    onChange={(value: string) => {
                                        form.setValue('providerId', value, { shouldValidate: true });
                                    }}
                                    placeholder={isLoadingProviders ? "Loading..." : "Select a provider..."}
                                    searchPlaceholder="Search providers..."
                                    disabled={!selectedClinicId || isLoadingProviders}
                                    />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Duration (minutes)</FormLabel>
                                <FormControl>
                                <Input type="number" placeholder="e.g., 30" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="appointmentDateTime"
                            render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Appointment Date and Time</FormLabel>
                                <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                        disabled={!selectedProviderId}
                                    >
                                        {field.value ? format(field.value, "PPP HH:mm") : <span>Pick a date and time</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        if (date && date >= today) {
                                            field.onChange(date);
                                        }
                                    }}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                    />
                                    <div className="p-3 border-t border-border">
                                    <TimePicker setDate={field.onChange} date={field.value} isTimeBlocked={isTimeBlocked} />
                                    </div>
                                </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any relevant notes for the appointment..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isPending || !form.formState.isValid} className="w-full">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Appointment
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
