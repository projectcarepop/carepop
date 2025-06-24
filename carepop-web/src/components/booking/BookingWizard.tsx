'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { format as formatDate, parseISO } from 'date-fns';

import type { Service, Clinic, NewAppointment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DatePicker } from '../ui/date-picker';

// --- Types for this component ---
interface BookingState {
  serviceId?: string;
  clinicId?: string;
  doctorId?: string;
  appointmentTime?: string; // Stored as "YYYY-MM-DDTHH:mm:ss.sssZ"
}

interface AvailabilityData {
    doctorId: string;
    doctorName: string;
    availableSlots: string[]; // "HH:mm"
}

// --- Data Fetching Functions ---
// Fetches all available services from the public API
const fetchServices = async (): Promise<Service[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${apiUrl}/api/public/services`);
  if (!res.ok) {
    throw new Error('Failed to fetch services. Please try again later.');
  }
  const data = await res.json();
  return data.data;
};

// Fetches clinics that offer a specific service
const fetchClinics = async (serviceId: string): Promise<Clinic[]> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${apiUrl}/api/public/clinics?serviceId=${serviceId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch clinics for the selected service.');
  }
  const data = await res.json();
  return data.data;
};

// Fetches doctor availability for a specific service, clinic, and date
const fetchAvailability = async (
    serviceId: string,
    clinicId: string,
    date: Date
): Promise<AvailabilityData[]> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const formattedDate = formatDate(date, 'yyyy-MM-dd');
    const res = await fetch(`${apiUrl}/api/public/availability?serviceId=${serviceId}&clinicId=${clinicId}&date=${formattedDate}`);
    if (!res.ok) {
        throw new Error('Failed to fetch availability for the selected date.');
    }
    const data = await res.json();
    return data.data;
}

const MAX_STEPS = 4;

export function BookingWizard() {
  const [step, setStep] = useState(1);
  const [bookingState, setBookingState] = useState<BookingState>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { toast } = useToast();
  const router = useRouter();

  // --- Step 1: Fetch Services ---
  const { 
    data: services, 
    isLoading: isLoadingServices, 
    error: servicesError 
  } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // --- Step 2: Fetch Clinics based on selected service ---
  const {
    data: clinics,
    isLoading: isLoadingClinics,
    error: clinicsError,
  } = useQuery({
    queryKey: ['clinics', bookingState.serviceId],
    queryFn: () => fetchClinics(bookingState.serviceId!),
    enabled: !!bookingState.serviceId, // Only run this query when a serviceId is selected
    staleTime: 5 * 60 * 1000,
  });

    // --- Step 3: Fetch Availability based on service, clinic, and date ---
    const {
        data: availability,
        isLoading: isLoadingAvailability,
        error: availabilityError,
    } = useQuery({
        queryKey: ['availability', bookingState.serviceId, bookingState.clinicId, selectedDate],
        queryFn: () => fetchAvailability(bookingState.serviceId!, bookingState.clinicId!, selectedDate!),
        enabled: !!bookingState.serviceId && !!bookingState.clinicId && !!selectedDate,
        staleTime: 5 * 60 * 1000,
    });

  // --- Step 4: Create Appointment Mutation ---
  const { mutate: createAppointment, isPending: isCreatingAppointment } = useMutation({
    mutationFn: async (appointmentData: Omit<NewAppointment, 'patientId' | 'id' | 'createdAt' | 'status'>) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        // This is a placeholder for getting the auth token.
        // In a real app, this would come from your auth context or a session management utility.
        const tempGetAuthToken = () => {
          // Replace this with your actual token retrieval logic
          console.warn("Using placeholder for auth token. This is not secure.");
          return "your-placeholder-auth-token";
        }
        
        const res = await fetch(`${apiUrl}/api/me/appointments`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tempGetAuthToken()}`
             },
            body: JSON.stringify(appointmentData),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Failed to book appointment. Please try again.' }));
            throw new Error(errorData.message);
        }
        return res.json();
    },
    onSuccess: () => {
        toast({
            title: "Appointment Booked!",
            description: "Your appointment has been successfully scheduled.",
            variant: 'default',
        });
        router.push('/main-dashboard');
    },
    onError: (error: Error) => {
        toast({
            title: "Booking Failed",
            description: error.message,
            variant: "destructive",
        });
    },
  });

  // --- Actions ---
  const nextStep = () => setStep((prev) => Math.min(prev + 1, MAX_STEPS));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const selectService = (serviceId: string) => {
    setBookingState({ serviceId }); // Reset state when changing service
    nextStep();
  };

  const selectClinic = (clinicId: string) => {
    setBookingState((prev) => ({ ...prev, clinicId }));
    nextStep();
  }

  const selectSlot = (doctorId: string, time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    const appointmentDateTime = new Date(selectedDate!);
    appointmentDateTime.setHours(hour, minute, 0, 0);

    setBookingState((prev) => ({
      ...prev,
      doctorId,
      appointmentTime: appointmentDateTime.toISOString(),
    }));
    nextStep();
  };

  const handleConfirmBooking = () => {
    if (bookingState.serviceId && bookingState.clinicId && bookingState.doctorId && bookingState.appointmentTime) {
        createAppointment({
            serviceId: bookingState.serviceId,
            clinicId: bookingState.clinicId,
            doctorId: bookingState.doctorId,
            appointmentTime: bookingState.appointmentTime,
        });
    } else {
        toast({ title: "Missing Information", description: "Please complete all previous steps.", variant: "destructive" });
    }
  };

  // Find selected items for the summary view
  const selectedService = services?.find(s => s.id === bookingState.serviceId);
  const selectedClinic = clinics?.find(c => c.id === bookingState.clinicId);
  // NOTE: We don't have the full doctor list, so we can't get the name here without another fetch or changing the availability endpoint.
  // We will display the ID for now as a placeholder.

  const renderStepContent = () => {
    switch (step) {
      case 1:
        // Service Selection UI
        if (isLoadingServices) return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
        if (servicesError) return <Alert variant="destructive"><XCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{servicesError.message}</AlertDescription></Alert>;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services?.map((service) => (
              <button key={service.id} onClick={() => selectService(service.id)} className="text-left">
                <Card className="hover:border-primary hover:shadow-lg transition-all"><CardContent className="p-6"><h3 className="text-lg font-semibold">{service.name}</h3><p className="text-sm text-muted-foreground mt-1">{service.description}</p><p className="text-lg font-bold mt-4">${service.price}</p></CardContent></Card>
              </button>
            ))}
          </div>
        );
      case 2:
        // Clinic Selection UI
        if (isLoadingClinics) return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
        if (clinicsError) return <Alert variant="destructive"><XCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{clinicsError.message}</AlertDescription></Alert>;
        if (clinics && clinics.length === 0) return <Alert><CheckCircle className="h-4 w-4" /><AlertTitle>No Clinics Available</AlertTitle><AlertDescription>There are currently no clinics offering this service. Please go back and select a different service.</AlertDescription></Alert>;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clinics?.map((clinic) => (
              <button key={clinic.id} onClick={() => selectClinic(clinic.id)} className="text-left">
                <Card className="hover:border-primary hover:shadow-lg transition-all h-full"><CardContent className="p-6"><h3 className="text-lg font-semibold">{clinic.name}</h3><p className="text-sm text-muted-foreground mt-1">{clinic.address?.toString()}</p></CardContent></Card>
              </button>
            ))}
          </div>
        );
      case 3:
        // --- Doctor and Time Selection UI ---
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Select a Date</h3>
              <DatePicker date={selectedDate} setDate={setSelectedDate} disabled={(date) => date < new Date()} />
            </div>
            
            {isLoadingAvailability && <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
            {availabilityError && <Alert variant="destructive"><XCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{availabilityError.message}</AlertDescription></Alert>}

            {availability && availability.length === 0 && !isLoadingAvailability && (
                 <Alert><CheckCircle className="h-4 w-4" /><AlertTitle>No Availability</AlertTitle><AlertDescription>There are no available slots for the selected date. Please try another date.</AlertDescription></Alert>
            )}

            <div className="space-y-4">
                {availability?.map((doc) => (
                    <div key={doc.doctorId}>
                        <h4 className="font-semibold">{doc.doctorName}</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {doc.availableSlots.map((slot) => (
                                <Button key={slot} variant="outline" onClick={() => selectSlot(doc.doctorId, slot)}>
                                    {slot}
                                </Button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        );
      case 4:
        // --- Confirmation UI ---
        return (
            <div className="space-y-6">
                <h3 className="text-2xl font-semibold">Confirm Your Appointment</h3>
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Service</span>
                            <span className="font-semibold">{selectedService?.name || '...'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-semibold">${selectedService?.price || '...'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Clinic</span>
                            <span className="font-semibold">{selectedClinic?.name || '...'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Date & Time</span>
                            <span className="font-semibold">
                                {bookingState.appointmentTime 
                                    ? formatDate(parseISO(bookingState.appointmentTime), 'PPP, h:mm a') 
                                    : '...'}
                            </span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Doctor ID</span>
                            <span className="font-semibold font-mono text-sm">{bookingState.doctorId || '...'}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
      default:
        return <div>Invalid Step</div>;
    }
  };

  return (
    <CardContent>
      <Progress value={(step / MAX_STEPS) * 100} className="mb-8" />
      {renderStepContent()}
      <CardFooter className="flex justify-between mt-8">
        <Button variant="ghost" onClick={prevStep} disabled={step === 1 || isCreatingAppointment}>
          Back
        </Button>
        {step === MAX_STEPS && (
            <Button onClick={handleConfirmBooking} disabled={isCreatingAppointment}>
                {isCreatingAppointment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm & Book
            </Button>
        )}
      </CardFooter>
    </CardContent>
  );
} 