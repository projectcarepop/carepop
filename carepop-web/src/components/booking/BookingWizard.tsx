"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { format, startOfDay, endOfDay, addDays, addMinutes, setHours, isBefore } from "date-fns";

import { useAuth } from '@/lib/contexts/auth-context';
import {
  getPublicClinics,
  getPublicServices,
  createAppointment,
  getPublicServiceCategories,
  getClinicAppointments,
  type BookedAppointment,
} from "@/services/api";
import { type ServiceWithCategory, type Clinic, type AppointmentBookingPayload, type ServiceCategory } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";

interface Address {
  street: string;
  barangay: string;
  city: string;
  province: string;
  zip: string;
}

const BookingWizard = () => {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, session } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [clinicSearch, setClinicSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');

  // --- DATA FETCHING (REFACTORED) ---

  const {
    data: clinics,
    isLoading: isLoadingClinics,
  } = useQuery<Clinic[]>({
    queryKey: ['clinics'],
    queryFn: () => getPublicClinics(),
  });

  const {
    data: services,
    isLoading: isLoadingServices,
  } = useQuery<ServiceWithCategory[], Error>({
    queryKey: ['publicServices', selectedClinicId],
    queryFn: () => getPublicServices(selectedClinicId!),
    enabled: !!selectedClinicId,
  });
  
  const {
    data: categories,
  } = useQuery<ServiceCategory[], Error>({
    queryKey: ['serviceCategories'],
    queryFn: getPublicServiceCategories,
  });

  const {
    data: bookedAppointments,
    isLoading: isLoadingAppointments,
    isError: isErrorAppointments,
  } = useQuery<BookedAppointment[], Error>({
    queryKey: ['clinicAppointments', selectedClinicId],
    queryFn: () => {
      const today = startOfDay(new Date());
      const futureDate = endOfDay(addDays(today, 90));
      return getClinicAppointments({
        clinicId: selectedClinicId!,
        startDate: today.toISOString(),
        endDate: futureDate.toISOString(),
      });
    },
    enabled: !!selectedClinicId,
  });

  const selectedService = useMemo(() => services?.find(s => s.id === selectedServiceId), [services, selectedServiceId]);

  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedService || !bookedAppointments) {
      return [];
    }
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);
    const bookedSlotsForDay = new Set(
      bookedAppointments
        .map(appt => new Date(appt.appointmentTime))
        .filter(apptTime => apptTime >= dayStart && apptTime < dayEnd)
        .map(apptTime => apptTime.toISOString())
    );

    const potentialSlots = [];
    const serviceDuration = selectedService.durationMinutes;
    let currentTime = setHours(dayStart, 9);
    const endTime = setHours(dayStart, 17);

    while (isBefore(currentTime, endTime)) {
      potentialSlots.push(currentTime.toISOString());
      currentTime = addMinutes(currentTime, serviceDuration);
    }
    return potentialSlots.filter(slot => !bookedSlotsForDay.has(slot));
  }, [selectedDate, selectedService, bookedAppointments]);


  // --- CLIENT-SIDE FILTERING LOGIC ---
  const filteredClinics = useMemo(() => {
    if (!clinics) return [];
    return clinics.filter(clinic =>
      clinic.name.toLowerCase().includes(clinicSearch.toLowerCase())
    );
  }, [clinics, clinicSearch]);

  const filteredServicesByCategory = useMemo(() => {
    if (!services) return [];
    if (selectedCategoryId === 'all') return services;
    return services.filter(service => service.serviceCategory?.id === selectedCategoryId);
  }, [services, selectedCategoryId]);

  const filteredServicesByName = useMemo(() => {
    if (!filteredServicesByCategory) return [];
    return filteredServicesByCategory.filter(service =>
      service.name.toLowerCase().includes(serviceSearch.toLowerCase())
    );
  }, [filteredServicesByCategory, serviceSearch]);

  // --- MUTATION ---
  const { mutate: submitAppointment, isPending: isBooking } = useMutation({
    mutationFn: (payload: AppointmentBookingPayload) => {
      if (!session?.access_token) throw new Error("Authentication error: You are not signed in.");
      return createAppointment(payload, session.access_token);
    },
    onSuccess: () => {
      toast({ title: "Success!", description: "Your appointment has been booked." });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      router.push("/main-dashboard");
    },
    onError: (error) => {
      toast({ title: "Booking Failed", description: error.message || "Could not book the appointment.", variant: "destructive" });
    },
  });

  // --- HANDLERS ---
  const handleSelectClinic = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    setStep(2);
  };
  
  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setStep(3);
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep(4);
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedClinicId || !selectedServiceId || !selectedDate || !selectedTime) {
      toast({ title: "Missing Information", description: "Please complete all previous steps.", variant: "destructive" });
      return;
    }
    const backendPayload = {
      patientId: user.id,
      clinicId: selectedClinicId,
      serviceId: selectedServiceId,
      appointmentTime: selectedTime,
      doctorId: '02ab0a6b-b366-4c10-9b75-623a5be46f1d', 
    };
    submitAppointment(backendPayload);
  };
  
  const progressValue = useMemo(() => (step - 1) * (100 / 4), [step]);
  const selectedClinic = useMemo(() => clinics?.find(c => c.id === selectedClinicId), [clinics, selectedClinicId]);

  // --- RENDER LOGIC ---
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Step 1: Select a Clinic</CardTitle>
              <CardDescription>Choose your preferred clinic location to begin.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search for a clinic by name..."
                  value={clinicSearch}
                  onChange={(e) => setClinicSearch(e.target.value)}
                />
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {isLoadingClinics ? (
                  <p>Loading clinics...</p>
                ) : (
                  filteredClinics.map((clinic) => (
                    <Button
                      key={clinic.id}
                      variant="outline"
                      className="w-full justify-start h-auto"
                      onClick={() => handleSelectClinic(clinic.id)}
                    >
                      <div className="text-left">
                        <p className="font-semibold">{clinic.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(clinic.address as Address)?.street}, {(clinic.address as Address)?.city}
                        </p>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Step 2: Select a Service</CardTitle>
              <CardDescription>What service are you looking for at {selectedClinic?.name}?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger className="w-1/3">
                    <SelectValue placeholder="Filter by category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input
                  className="w-2/3"
                  placeholder="Search for a service by name..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                />
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {isLoadingServices ? (
                  <p>Loading services...</p>
                ) : (
                  filteredServicesByName.map((service) => (
                    <Button
                      key={service.id}
                      variant="outline"
                      className="w-full justify-start h-auto"
                      onClick={() => handleSelectService(service.id)}
                    >
                      <div className="text-left">
                        <p className="font-semibold">{service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.serviceCategory?.name}</p>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            </CardFooter>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Step 3: Select Date & Time</CardTitle>
              <CardDescription>Choose a date and time for your appointment.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <div className="flex-shrink-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date as Date);
                    setSelectedTime(null);
                  }}
                  disabled={(date) => date < startOfDay(new Date())}
                  initialFocus
                />
              </div>
              <div className="flex-grow border-l pl-4">
                <h4 className="font-semibold mb-2">
                  {selectedDate ? `Available Slots for ${format(selectedDate, 'PPP')}` : 'Please select a date'}
                </h4>
                {isLoadingAppointments ? (
                  <p>Loading availability...</p>
                ) : isErrorAppointments ? (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Could not load appointment data. Please try again later.</AlertDescription>
                  </Alert>
                ) : !selectedDate ? (
                   <p className="text-sm text-muted-foreground">Select a date to see available times.</p>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? 'default' : 'outline'}
                        onClick={() => handleSelectTime(time)}
                      >
                        {format(new Date(time), 'p')}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No available slots for this day.</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            </CardFooter>
          </Card>
        );
      case 4:
        return (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Step 4: Confirm Your Booking</CardTitle>
                <CardDescription>Please review your appointment details below.</CardDescription>
              </CardHeader>
              <CardContent>
                  {selectedClinic && selectedService && selectedDate && selectedTime ? (
                      <div className="space-y-4">
                          <div>
                              <p className="font-semibold">Clinic:</p>
                              <p>{selectedClinic.name}</p>
                              <p className="text-sm text-muted-foreground">{(selectedClinic.address as Address)?.street}, {(selectedClinic.address as Address)?.city}</p>
                          </div>
                          <div>
                              <p className="font-semibold">Service:</p>
                              <p>{selectedService.name}</p>
                          </div>
                          <div>
                              <p className="font-semibold">Date & Time:</p>
                              <p>{format(new Date(selectedTime), 'PPPP p')}</p>
                          </div>
                      </div>
                  ) : (
                      <p>Loading details...</p>
                  )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <Button onClick={handleConfirmBooking} disabled={isBooking}>
                  {isBooking ? 'Booking...' : 'Confirm Appointment'}
                </Button>
              </CardFooter>
            </Card>
        );
      default:
        return <p>Something went wrong. Please refresh the page.</p>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <div className="flex justify-between mb-1">
            <h2 className="text-2xl font-bold">Book an Appointment</h2>
            <span className="text-sm font-medium">Step {step} of 4</span>
        </div>
        <Progress value={progressValue} className="w-full" />
      </div>

      <div className="flex flex-col gap-8">
        <div className="w-full">
          {renderStep()}
        </div>
        <div className="w-full">
            <Card>
                <CardHeader>
                    <CardTitle>Your Selections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div>
                        <p className="font-semibold">Clinic:</p>
                        <p className="text-muted-foreground">{selectedClinic?.name || 'Not selected'}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Service:</p>
                        <p className="text-muted-foreground">{selectedService?.name || 'Not selected'}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Date:</p>
                        <p className="text-muted-foreground">{selectedDate ? format(selectedDate, 'PPP') : 'Not selected'}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Time:</p>
                        <p className="text-muted-foreground">{selectedTime ? format(new Date(selectedTime), 'p') : 'Not selected'}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;