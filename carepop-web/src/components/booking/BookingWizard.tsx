"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { format, startOfToday } from "date-fns";

import { useAuth } from '@/lib/contexts/auth-context';
import {
  getPublicClinics,
  getPublicServices,
  createAppointment,
  getPublicServiceCategories,
  getAvailableSlots,
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

// This interface needs to match the actual address object from the backend/DB
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

  // State reflects the new "Clinic-first" flow
  const [step, setStep] = useState(1);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null); // This will now be the full datetime string from the API
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [clinicSearch, setClinicSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');

  // --- DATA FETCHING (NEW FLOW) ---

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
    data: availableSlots,
    isLoading: isLoadingAvailability,
  } = useQuery<string[], Error>({
    queryKey: ['availabilitySlots', selectedClinicId, selectedServiceId, selectedDate],
    queryFn: () => {
      // @ts-expect-error - Assuming getAvailableSlots will be created in api.ts
      return getAvailableSlots({
        clinicId: selectedClinicId!,
        serviceId: selectedServiceId!,
        date: format(selectedDate!, 'yyyy-MM-dd'),
      });
    },
    enabled: !!(selectedClinicId && selectedServiceId && selectedDate),
  });

  // --- CLIENT-SIDE FILTERING LOGIC ---

  const filteredClinics = useMemo(() => {
    if (!clinics) return [];
    return clinics.filter(clinic =>
      clinic.name.toLowerCase().includes(clinicSearch.toLowerCase())
    );
  }, [clinics, clinicSearch]);

  const filteredServicesByCategory = useMemo(() => {
    if (!services) {
      return [];
    }
    if (selectedCategoryId === 'all') {
      return services;
    }
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
    mutationFn: async (payload: AppointmentBookingPayload) => {
      if (!session?.access_token) {
        throw new Error("Authentication error: You are not signed in.");
      }
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
      appointmentTime: selectedTime, // selectedTime is now the full ISO string
      doctorId: '02ab0a6b-b366-4c10-9b75-623a5be46f1d', 
    };

    submitAppointment(backendPayload);
  };
  
  const progressValue = useMemo(() => {
    return (step - 1) * (100 / 4);
  }, [step]);

  const selectedClinic = useMemo(() => clinics?.find(c => c.id === selectedClinicId), [clinics, selectedClinicId]);
  const selectedService = useMemo(() => services?.find(s => s.id === selectedServiceId), [services, selectedServiceId]);

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
            <CardFooter className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!selectedClinicId}>Next</Button>
            </CardFooter>
          </Card>
        );
      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Step 2: Select a Service</CardTitle>
              <CardDescription>What type of service do you need today at {selectedClinic?.name}?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3">
                  <Input
                    placeholder="Search for a service..."
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                  />
                </div>
                <div className="md:w-1/3">
                  <Select
                    value={selectedCategoryId}
                    onValueChange={(value) => setSelectedCategoryId(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((cat: ServiceCategory) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-2">
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
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={!selectedServiceId}>Next</Button>
            </CardFooter>
          </Card>
        );
      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Select a Date & Time</CardTitle>
              <CardDescription>
                Available slots for {selectedService?.name} at {selectedClinic?.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < startOfToday()}
                  className="rounded-md border"
                />
              </div>
              <div className="md:w-1/2">
                <h4 className="font-semibold mb-2 text-center md:text-left">
                  {selectedDate ? `Available Times for ${format(selectedDate, 'PPP')}` : 'Please select a date'}
                </h4>
                {isLoadingAvailability ? (
                  <p>Loading availability...</p>
                ) : selectedDate && availableSlots ? (
                  availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableSlots.map((time: string) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          onClick={() => handleSelectTime(time)}
                        >
                          {format(new Date(time), 'p')}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertTitle>No Slots Available</AlertTitle>
                      <AlertDescription>There are no available appointments for this day. Please select another date.</AlertDescription>
                    </Alert>
                  )
                ) : (
                  selectedDate && <p>Select a date to see available times.</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => setStep(4)} disabled={!selectedTime}>Next</Button>
            </CardFooter>
          </Card>
        );
      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Step 4: Confirm Your Appointment</CardTitle>
              <CardDescription>Please review the details below before confirming.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Clinic:</h3>
                  <p className="text-muted-foreground">{selectedClinic?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedClinic?.address as Address)?.street}, {(selectedClinic?.address as Address)?.city}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Service</h4>
                  <p className="text-muted-foreground">{selectedService?.name}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Date & Time</h4>
                  <p className="text-muted-foreground">
                    {selectedTime ? 
                      format(new Date(selectedTime), 'EEEE, MMMM d, yyyy \'at\' p')
                      : 'Not selected'}
                  </p>
                </div>
              </div>
              <Alert className="mt-6">
                <AlertTitle>Thank you for your booking request!</AlertTitle>
                <AlertDescription>
                  {`Your request for a '${selectedService?.name}' at ${selectedClinic?.name} has been sent. The clinic will confirm your appointment shortly.`}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>Go Back</Button>
                <Button onClick={handleConfirmBooking} disabled={isBooking}>
                  {isBooking ? 'Booking...' : 'Confirm Appointment'}
                </Button>
            </CardFooter>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Progress value={progressValue} className="mb-8" />
      {renderStep()}
    </div>
  );
};

export default BookingWizard;