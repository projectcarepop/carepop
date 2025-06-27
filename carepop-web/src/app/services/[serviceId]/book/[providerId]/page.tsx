'use client';

import { useState, useEffect } from 'react';
import { getPublicAvailability, createAppointment } from '@/services/api';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useSupabase } from '@/lib/contexts/auth-context';

interface BookingPageProps {
    params: {
        serviceId: string;
        providerId: string;
    }
}

export default function BookingPage({ params }: BookingPageProps) {
    const { serviceId, providerId } = params;
    const { user } = useSupabase();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [availability, setAvailability] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (date) {
            const fetchAvailability = async () => {
                setIsLoading(true);
                setAvailability([]);
                setSelectedSlot(null);
                try {
                    const formattedDate = format(date, 'yyyy-MM-dd');
                    const slots = await getPublicAvailability({
                        clinicId: providerId,
                        serviceId,
                        date: formattedDate
                    });
                    setAvailability(slots);
                } catch (error) {
                    console.error(error);
                    toast({ title: 'Error', description: 'Failed to fetch availability.', variant: 'destructive' });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAvailability();
        }
    }, [date, providerId, serviceId, toast]);
    
    const handleBooking = async () => {
        if (!selectedSlot || !user) {
            toast({ title: 'Error', description: 'You must be logged in to book.', variant: 'destructive' });
            return;
        }

        try {
            const appointmentDetails = {
                patientId: user.id,
                clinicId: providerId,
                serviceId,
                appointmentTime: selectedSlot.start_time,
            };
            await createAppointment(appointmentDetails);
            toast({ title: 'Success!', description: 'Your appointment has been booked.' });
            router.push(`/appointments`);

        } catch (error: any) {
            console.error(error);
            toast({ title: 'Booking Failed', description: error.message || 'An unexpected error occurred.', variant: 'destructive' });
        }
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">Select a Date & Time</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                        disabled={(d) => d < new Date(new Date().toDateString())}
                    />
                </div>
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-bold mb-4">
                        Available Slots for {date ? format(date, 'PPP') : ''}
                    </h2>
                    {isLoading ? (
                        <div className="animate-pulse space-y-2">
                            <div className="h-10 bg-muted rounded w-1/4"></div>
                            <div className="h-10 bg-muted rounded w-1/3"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                            {availability.length > 0 ? (
                                availability.map((slot, index) => (
                                    <Button 
                                        key={index}
                                        variant={selectedSlot?.start_time === slot.start_time ? 'default' : 'outline'}
                                        onClick={() => setSelectedSlot(slot)}
                                    >
                                        {format(new Date(slot.start_time), 'p')}
                                    </Button>
                                ))
                            ) : (
                                <p>No available slots for this day.</p>
                            )}
                        </div>
                    )}

                    {selectedSlot && (
                         <div className="mt-8 p-4 border rounded-lg">
                            <h3 className="font-bold text-lg mb-2">Confirm Your Booking</h3>
                            <p><strong>Service:</strong> [Service Name]</p>
                            <p><strong>Provider:</strong> [Provider Name]</p>
                            <p><strong>Time:</strong> {format(new Date(selectedSlot.start_time), 'PPP, p')}</p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="mt-4 w-full">Confirm Appointment</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            You are about to book an appointment for {format(new Date(selectedSlot.start_time), 'PPP, p')}. Do you wish to continue?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleBooking}>Yes, Book Now</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 