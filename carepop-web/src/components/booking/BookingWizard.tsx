'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { format, addDays, isBefore } from 'date-fns';

import { useToast } from '@/hooks/use-toast';
import { getPublicServices, getPublicClinics, getPublicAvailability, createAppointment } from '@/services/api';
import { type Service, type Clinic, type NewAppointment } from '@/lib/types';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from 'lucide-react';

// --- Main Wizard Component ---

export function BookingWizard() {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // --- Data Fetching ---
    const { data: services = [], isLoading: isLoadingServices } = useQuery({
        queryKey: ['publicServices'],
        queryFn: getPublicServices,
    });

    const { data: clinics = [], isLoading: isLoadingClinics } = useQuery({
        queryKey: ['publicClinics', selectedService?.id],
        queryFn: () => getPublicClinics(selectedService!.id),
        enabled: !!selectedService,
    });

    const { data: availability = [], isLoading: isLoadingAvailability } = useQuery<string[]>({
        queryKey: ['publicAvailability', selectedClinic?.id, selectedService?.id, selectedDate],
        queryFn: () => getPublicAvailability({
            serviceId: selectedService!.id,
            clinicId: selectedClinic!.id,
            date: format(selectedDate!, 'yyyy-MM-dd')
        }),
        enabled: !!selectedService && !!selectedClinic && !!selectedDate,
    });

    // --- Mutation ---
    const { mutate: bookAppointment, isPending: isBooking } = useMutation({
        mutationFn: createAppointment,
        onSuccess: () => {
            toast({ title: "Appointment Booked!", description: "Your appointment has been successfully scheduled." });
            queryClient.invalidateQueries({ queryKey: ['appointments'] }); // Invalidate user's appointments
            router.push('/main-dashboard');
        },
        onError: (err: Error) => {
            toast({ title: "Booking Failed", description: err.message, variant: "destructive" });
        }
    });

    // --- Handlers ---
    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);
    
    const handleBookNow = () => {
        if (!selectedService || !selectedClinic || !selectedDate || !selectedTime) {
            toast({ title: "Missing Information", description: "Please ensure all details are selected.", variant: "destructive" });
            return;
        }

        const appointmentDateTime = new Date(selectedDate);
        const [hours, minutes] = selectedTime.split(':').map(Number);
        appointmentDateTime.setHours(hours, minutes, 0, 0);

        const newAppointment: NewAppointment = {
            patientId: 'user-placeholder', // This will be replaced by the backend based on auth
            doctorId: 'doctor-placeholder', // This should be selected in a future step
            clinicId: selectedClinic.id,
            serviceId: selectedService.id,
            appointmentTime: appointmentDateTime.toISOString(),
            status: 'scheduled',
        };

        bookAppointment(newAppointment);
    };


    const renderStep = () => {
        switch (step) {
            case 1: // Select Service
                return (
                    <div className="space-y-4">
                        {isLoadingServices && <Loader2 className="animate-spin" />}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {services.map((service: Service) => (
                                <Button key={service.id} variant={selectedService?.id === service.id ? "default" : "outline"} onClick={() => setSelectedService(service)} className="h-auto py-4 flex flex-col items-start text-left">
                                    <h3 className="font-bold">{service.name}</h3>
                                    <p className="text-sm text-muted-foreground">{service.description}</p>
                                    <p className="font-bold mt-2">₱{service.price}</p>
                                </Button>
                            ))}
                        </div>
                    </div>
                );
            case 2: // Select Clinic
                return (
                     <div className="space-y-4">
                        {isLoadingClinics && <Loader2 className="animate-spin" />}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {clinics.map((clinic: Clinic) => (
                                <Button key={clinic.id} variant={selectedClinic?.id === clinic.id ? "default" : "outline"} onClick={() => setSelectedClinic(clinic)} className="h-auto py-4 flex flex-col items-start text-left">
                                    <h3 className="font-bold">{clinic.name}</h3>
                                    <p className="text-sm text-muted-foreground">{clinic.address}</p>
                                </Button>
                            ))}
                        </div>
                    </div>
                );
            case 3: // Select Date & Time
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold mb-2">Select a Date</h3>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                    setSelectedDate(date);
                                    setSelectedTime(null); // Reset time when date changes
                                }}
                                disabled={(date) => isBefore(date, addDays(new Date(), -1))} // Disable past dates
                                className="rounded-md border"
                            />
                        </div>
                        <div>
                             <h3 className="font-semibold mb-2">Select a Time</h3>
                             {isLoadingAvailability && <Loader2 className="animate-spin" />}
                             <div className="grid grid-cols-3 gap-2">
                                {availability.map((time) => (
                                    <Button key={time} variant={selectedTime === time ? "default" : "outline"} onClick={() => setSelectedTime(time)}>
                                        {format(new Date(`1970-01-01T${time}`), 'p')}
                                    </Button>
                                ))}
                                {!isLoadingAvailability && availability.length === 0 && selectedDate && (
                                    <p className="text-muted-foreground col-span-3">No available slots on this date.</p>
                                )}
                             </div>
                        </div>
                    </div>
                );
            case 4: // Confirmation
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Confirm Your Appointment</CardTitle>
                            <CardDescription>Please review the details below before confirming.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between"><span className="font-semibold">Service:</span> <span>{selectedService?.name}</span></div>
                            <div className="flex justify-between"><span className="font-semibold">Clinic:</span> <span>{selectedClinic?.name}</span></div>
                            <div className="flex justify-between"><span className="font-semibold">Date:</span> <span>{selectedDate && format(selectedDate, 'PPP')}</span></div>
                            <div className="flex justify-between"><span className="font-semibold">Time:</span> <span>{selectedTime && format(new Date(`1970-01-01T${selectedTime}`), 'p')}</span></div>
                             <div className="flex justify-between font-bold text-lg"><span >Total:</span> <span>₱{selectedService?.price}</span></div>
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    };

    const canGoNext = () => {
        switch(step) {
            case 1: return !!selectedService;
            case 2: return !!selectedClinic;
            case 3: return !!selectedDate && !!selectedTime;
            default: return false;
        }
    }

    return (
        <div>
            <div className="mb-8">
                {/* Could add a steps indicator here */}
            </div>

            <div>{renderStep()}</div>
            
            <div className="mt-8 flex justify-between">
                {step > 1 && (
                    <Button variant="outline" onClick={handleBack} disabled={isBooking}>Back</Button>
                )}
                {step < 4 && (
                    <Button onClick={handleNext} disabled={!canGoNext() || isBooking}>Next</Button>
                )}
                 {step === 4 && (
                    <Button onClick={handleBookNow} disabled={isBooking}>
                        {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm & Book
                    </Button>
                )}
            </div>
        </div>
    );
} 