"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { useAuth } from '@/lib/contexts/auth-context';
import {
  getPublicClinics,
  getPublicServices,
  getPublicAvailability,
  createAppointment,
  getPublicAvailableDates,
  getPublicServiceCategories,
} from "@/services/api";
import { type ServiceWithCategory, type Clinic, type NewAppointment, type ServiceCategory } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Input } from "@/components/ui/input";

// Define the shape of the availability data
interface Availability {
  doctorId: string;
  doctorName: string;
  availableSlots: string[];
}

const BookingWizard = () => {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { supabase, user } = useAuth();

  // State reflects the new "Clinic-first" flow
  const [step, setStep] = useState(1);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [clinicSearch, setClinicSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');

  // --- DATA FETCHING (NEW FLOW) ---

  const {
    data: clinics,
    isLoading: isLoadingClinics,
    isError: isErrorClinics,
  } = useQuery<Clinic[]>({
    queryKey: ['clinics'],
    queryFn: getPublicClinics,
  });

  const {
    data: services,
    isLoading: isLoadingServices,
    isError: isErrorServices,
  } = useQuery<ServiceWithCategory[], Error>({
    queryKey: ['services', selectedClinicId],
    queryFn: async () => {
      if (!selectedClinicId) {
        return [];
      }
      try {
        console.log(`Fetching services for clinic: ${selectedClinicId}`);
        const result = await getPublicServices(selectedClinicId);
        console.log("Successfully fetched services:", result);
        return result;
      } catch (error) {
        console.error("Error inside getPublicServices queryFn:", error);
        toast({
          title: "Error Fetching Services",
          description: (error as Error).message || "Could not load services for the selected clinic.",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!selectedClinicId,
  });

  // ADD THIS DIAGNOSTIC LOG
  console.log("Raw services data from backend:", services);

  const {
    data: categories,
    isLoading: isLoadingServiceCategories,
  } = useQuery<any, Error, ServiceCategory[]>({
    queryKey: ['serviceCategories'],
    queryFn: getPublicServiceCategories,
    select: (response: { data: ServiceCategory[] }) => response.data || [],
    initialData: [],
  });

  const { data: availableDates, isLoading: isLoadingAvailableDates } = useQuery<string[]>({
    queryKey: ['availableDates', selectedClinicId, selectedServiceId],
    queryFn: () => getPublicAvailableDates({
      clinicId: selectedClinicId!,
      serviceId: selectedServiceId!,
    }),
    enabled: !!(selectedClinicId && selectedServiceId),
  });

  const {
    data: availability,
    isLoading: isLoadingAvailability,
    isError: isErrorAvailability,
  } = useQuery<Availability[]>({
    queryKey: ['availability', selectedClinicId, selectedServiceId, selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null],
    queryFn: () => getPublicAvailability({
      clinicId: selectedClinicId!,
      serviceId: selectedServiceId!,
      date: format(selectedDate!, 'yyyy-MM-dd'),
    }),
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
    // This filter is intentionally strict. It relies on the backend providing a correct
    // serviceCategory object with a valid ID. If a service is being filtered out,
    // it's likely because the data from the `GET /api/public/services` endpoint
    // has a `null` serviceCategory for that service, indicating a data integrity
    // issue in the database (e.g., the service has a null or incorrect `categoryId`).
    return services.filter(service => service.serviceCategory?.id === selectedCategoryId);
  }, [services, selectedCategoryId]);

  const filteredServicesByName = useMemo(() => {
    if (!filteredServicesByCategory) return [];
    return filteredServicesByCategory.filter(service =>
      service.name.toLowerCase().includes(serviceSearch.toLowerCase())
    );
  }, [filteredServicesByCategory, serviceSearch]);

  const availableDateObjects = useMemo(() => {
    if (!availableDates) return [];
    // The calendar component expects Date objects.
    // The dates from the API are strings like '2023-12-25'.
    // We need to parse them, being mindful of timezones.
    // Appending 'T00:00:00' ensures they are parsed in the local timezone.
    return availableDates.map(dateStr => new Date(dateStr + 'T00:00:00'));
  }, [availableDates]);

  // --- MUTATION ---

  const { mutate: submitAppointment, isPending: isBooking } = useMutation({
    mutationFn: async (payload: NewAppointment) => {
      if (!supabase) throw new Error("Supabase client is not available.");
      return createAppointment(supabase, payload);
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

  const handleSelectDoctorAndTime = (doctorId: string, time: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedTime(time);
    setStep(4);
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedClinicId || !selectedServiceId || !selectedDoctorId || !selectedDate || !selectedTime) {
      toast({ title: "Missing Information", description: "Please complete all previous steps.", variant: "destructive" });
      return;
    }
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const appointmentDateTime = new Date(selectedDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    const payload: NewAppointment = {
      patientId: user.id,
      clinicId: selectedClinicId,
      serviceId: selectedServiceId,
      doctorId: selectedDoctorId,
      appointmentTime: appointmentDateTime.toISOString(),
      status: 'scheduled',
    };
    submitAppointment(payload);
  };
  
  const progressValue = (step - 1) * (100 / 3);

  // --- RENDER LOGIC ---

  const renderStep = () => {
    switch (step) {
      case 1: // Select Clinic
        return (
          <Card>
            <CardHeader><CardTitle>Step 1: Select a Clinic</CardTitle><CardDescription>Choose your preferred clinic location to begin.</CardDescription></CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input
                  placeholder="Search for a clinic by name..."
                  value={clinicSearch}
                  onChange={(e) => setClinicSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              {isLoadingClinics && <p>Loading clinics...</p>}
              {isErrorClinics && <p className="text-destructive">Could not load clinics.</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClinics.map((clinic) => {
                  // Cast the address from 'unknown' to a specific shape to render its properties
                  const address = clinic.address as { street?: string; city?: string; region?: string; } | null;
                  return (
                    <Card key={clinic.id} onClick={() => handleSelectClinic(clinic.id)} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardHeader><CardTitle>{clinic.name}</CardTitle></CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{address?.street}</p>
                        <p className="text-sm text-muted-foreground">
                            {address?.city}{address?.city && address?.region ? ', ' : ''}{address?.region}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );

      case 2: // Select Service
        const selectedClinic = clinics?.find(c => c.id === selectedClinicId);
        return (
          <Card>
            <CardHeader>
                <CardTitle>Step 2: Select a Service</CardTitle>
                <CardDescription>Choose a service available at {selectedClinic?.name || 'your selected clinic'}.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <Select onValueChange={setSelectedCategoryId} defaultValue="all">
                        <SelectTrigger className="w-full md:w-[280px]">
                            <SelectValue placeholder="Filter by category..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {isLoadingServiceCategories ? (
                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                            ) : (
                                categories.map(category => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Search for a service..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        className="w-full md:max-w-sm"
                    />
                </div>
              {isLoadingServices && <p>Loading services...</p>}
              {isErrorServices && <p className="text-destructive">Could not load services for this clinic.</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredServicesByName.map((service) => (
                  <Card key={service.id} onClick={() => handleSelectService(service.id)} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardHeader><CardTitle>{service.name}</CardTitle><CardDescription>{service.description}</CardDescription></CardHeader>
                    <CardContent>
                      <p className="font-semibold">${Number(service.price).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{service.durationMinutes} minutes</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button variant="outline" onClick={() => setStep(1)} className="mt-6">Back</Button>
            </CardContent>
          </Card>
        );

      case 3: // Select Doctor and Time
        return (
          <Card>
            <CardHeader><CardTitle>Step 3: Select a Doctor & Time</CardTitle><CardDescription>Pick a date, then choose an available doctor and time slot.</CardDescription></CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8">
              <div className="flex justify-center">
                <Calendar 
                  mode="single" 
                  selected={selectedDate} 
                  onSelect={setSelectedDate} 
                  disabled={(date) => {
                    const isPast = date < new Date(new Date().setDate(new Date().getDate() - 1));
                    if (isPast) return true;
                    if (isLoadingAvailableDates || !availableDateObjects) return true; // Disable while loading
                    // Check if the current date is NOT in the list of available dates.
                    return !availableDateObjects.some(
                      availableDate => availableDate.toDateString() === date.toDateString()
                    );
                  }}
                  modifiers={{ available: availableDateObjects }}
                  modifiersStyles={{
                    available: {
                      fontWeight: 'bold',
                      color: 'var(--foreground)',
                      backgroundColor: 'var(--primary-foreground)',
                    }
                  }}
                  className="rounded-md border"
                />
              </div>
              <div className="flex-1">
                {isLoadingAvailability && selectedDate && <p>Checking availability...</p>}
                {isErrorAvailability && selectedDate && <p className="text-destructive">Could not load availability.</p>}
                {!selectedDate && (
                  <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Select a Date</AlertTitle>
                    <AlertDescription>
                      {isLoadingAvailableDates 
                        ? 'Loading available dates...' 
                        : 'Please select one of the highlighted dates on the calendar to see available slots.'}
                    </AlertDescription>
                  </Alert>
                )}
                {availability && availability.length === 0 && selectedDate && (
                  <Alert><Terminal className="h-4 w-4" /><AlertTitle>No Availability</AlertTitle><AlertDescription>No appointments available on this date. Please try another day.</AlertDescription></Alert>
                )}
                <div className="space-y-6">
                  {availability?.map((doc) => (
                    <div key={doc.doctorId}>
                      <h4 className="font-semibold mb-2">{doc.doctorName}</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {doc.availableSlots.map((time) => (
                          <Button key={time} variant="outline" onClick={() => handleSelectDoctorAndTime(doc.doctorId, time)}>{time}</Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardContent><Button variant="outline" onClick={() => setStep(2)}>Back</Button></CardContent>
          </Card>
        );

      case 4: // Confirmation
        const finalClinic = clinics?.find(c => c.id === selectedClinicId);
        const finalService = services?.find(s => s.id === selectedServiceId);
        const finalDoctor = availability?.find(a => a.doctorId === selectedDoctorId);
        return (
          <Card>
            <CardHeader><CardTitle>Step 4: Confirm Your Appointment</CardTitle><CardDescription>Please review the details below before confirming.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div><strong>Clinic:</strong> {finalClinic?.name}</div>
              <div><strong>Service:</strong> {finalService?.name}</div>
              <div><strong>Doctor:</strong> {finalDoctor?.doctorName}</div>
              <div><strong>Date:</strong> {selectedDate ? format(selectedDate, "PPP") : 'N/A'}</div>
              <div><strong>Time:</strong> {selectedTime}</div>
              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <Button onClick={handleConfirmBooking} disabled={isBooking}>{isBooking ? 'Booking...' : 'Confirm & Book'}</Button>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Book an Appointment</h1>
        <Progress value={progressValue} className="w-full" />
      </div>
      {renderStep()}
    </div>
  );
};

export default BookingWizard;