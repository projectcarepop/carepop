"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { format, startOfDay } from "date-fns";

import { useAuth } from '@/lib/contexts/auth-context';
import {
  getPublicClinics,
  getPublicServices,
  getPublicAvailability,
  createAppointment,
  getPublicAvailableDates,
  getPublicServiceCategories,
} from "@/services/api";
import { type ServiceWithCategory, type Clinic, type AppointmentBookingPayload, type ServiceCategory } from "@/lib/types";
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

// Define a type for the address object to resolve the 'unknown' type error.
interface Address {
  street: string;
  barangay: string;
  city: string;
  province: string;
  postalCode: string;
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
    queryFn: getPublicClinics,
  });

  const {
    data: services,
    isLoading: isLoadingServices,
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
  } = useQuery<any, Error, ServiceCategory[]>({
    queryKey: ['serviceCategories'],
    queryFn: getPublicServiceCategories,
    select: (response: { data: ServiceCategory[] }) => response.data || [],
    initialData: [],
  });

  const { data: availableDates } = useQuery<string[]>({
    queryKey: ['availableDates', selectedClinicId, selectedServiceId],
    queryFn: () => getPublicAvailableDates({
      clinicId: selectedClinicId!,
      serviceId: selectedServiceId!,
    }),
    enabled: !!(selectedClinicId && selectedServiceId),
  });

   const {
    data: availableSlots,
    isLoading: isLoadingAvailability,
    isError,
    error,
  } = useQuery<string[], Error>({ // Specify Error type for the hook
    queryKey: ['availability', selectedClinicId, selectedServiceId, selectedDate],
    queryFn: async () => {
      console.log('[ReactQuery - Availability] Starting queryFn...');
      if (!selectedClinicId || !selectedServiceId || !selectedDate) {
        console.log('[ReactQuery - Availability] Aborting: Missing dependencies.');
        return []; // Return an empty array if dependencies are not met
      }
      
      console.log('[ReactQuery - Availability] All dependencies present. Fetching...');
      return getPublicAvailability({
        clinicId: selectedClinicId,
        serviceId: selectedServiceId,
        date: format(selectedDate, 'yyyy-MM-dd'),
      });
    },
    // The enabled check is still good practice, but the internal check makes it safer.
    enabled: !!(selectedClinicId && selectedServiceId && selectedDate),
  });

  // --- [DIAGNOSTIC LOGS] ---
  console.log(`[ReactQuery - Availability] Is Loading: ${isLoadingAvailability}`);
  console.log(`[ReactQuery - Availability] Is Error: ${isError}`);
  if (isError) {
    console.error('[ReactQuery - Availability] Error: ', error);
  }
  console.log('[ReactQuery - Availability] Data: ', availableSlots);

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

    // This is a TEMPORARY FIX to unblock the booking process.
    const backendPayload = {
      patientId: user.id, // Add patientId to satisfy frontend type
      clinicId: selectedClinicId,
      serviceId: selectedServiceId,
      appointmentTime: selectedTime,
      // Using a real doctor ID to satisfy the foreign key constraint.
      doctorId: '02ab0a6b-b366-4c10-9b75-623a5be46f1d', 
    };

    submitAppointment(backendPayload);
  };
  
  const progressValue = (step - 1) * (100 / 3);

  const selectedClinic = useMemo(() => clinics?.find(c => c.id === selectedClinicId), [clinics, selectedClinicId]);
  const selectedService = useMemo(() => services?.find(s => s.id === selectedServiceId), [services, selectedServiceId]);

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClinics.map((clinic) => {
                  const address = clinic.address as { street?: string; city?: string; };
                  const formattedAddress = [address?.street, address?.city].filter(Boolean).join(', ');

                  return (
                    <Button
                      key={clinic.id}
                      variant={selectedClinicId === clinic.id ? "default" : "outline"}
                      onClick={() => handleSelectClinic(clinic.id)}
                      className="h-auto text-left justify-start"
                    >
                      <div>
                        <p className="font-semibold">{clinic.name}</p>
                        <p className="text-sm text-muted-foreground">{formattedAddress}</p>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      case 2: // Select Service
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Select a Service</CardTitle>
              <CardDescription>What type of service do you need today?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Search for a service..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={selectedCategoryId}
                  onValueChange={setSelectedCategoryId}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isLoadingServices && <p>Loading services...</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredServicesByName.map((service) => (
                  <Button
                    key={service.id}
                    variant={selectedServiceId === service.id ? "default" : "outline"}
                    onClick={() => handleSelectService(service.id)}
                    className="h-auto text-left justify-start"
                  >
                    <div>
                      <p className="font-semibold">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.serviceCategory?.name}</p>
                    </div>
                  </Button>
                ))}
              </div>
              {!isLoadingServices && filteredServicesByName.length === 0 && (
                <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>No Services Found</AlertTitle>
                  <AlertDescription>
                    There are no services matching your criteria at this clinic. Try changing the category or search term.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        );
      case 3: // Select Date & Time
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Select Date & Time</CardTitle>
              <CardDescription>
                Choose a date to see available time slots for your selected service.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < startOfDay(new Date())} // Disable past dates
                modifiers={{ available: availableDateObjects }}
                modifiersStyles={{ available: { fontWeight: 'bold' } }}
              />
              <div className="flex-1 border-l border-border pl-4">
                <h4 className="font-semibold mb-2">
                  Available Times for {selectedDate ? format(selectedDate, 'PPP') : '...'}
                </h4>
                {isLoadingAvailability && <p>Loading times...</p>}
                
                {/* --- [DIAGNOSTIC RENDERING] --- */}
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots && availableSlots.length > 0 ? (
                    availableSlots.map((time) => {
                      // 'time' is a full ISO string from the backend (e.g., "2025-06-27T01:00:00.000Z")
                      // It can be directly used to create a valid Date object.
                      const fullDateTime = new Date(time);
                      return (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          onClick={() => handleSelectTime(time)}
                        >
                          {format(fullDateTime, "h:mm a")}
                        </Button>
                      );
                    })
                  ) : (
                    !isLoadingAvailability && (
                      <p className="text-sm text-muted-foreground mt-2">
                        No available slots for this day. Please try another date.
                      </p>
                    )
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case 4: // Confirmation
        if (!selectedClinic || !selectedService || !selectedDate || !selectedTime) {
          return (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Missing Information</AlertTitle>
              <AlertDescription>
                Something went wrong. Please start over.
                <Button variant="link" onClick={() => setStep(1)}>Go to Step 1</Button>
              </AlertDescription>
            </Alert>
          );
        }
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Confirm Your Appointment</CardTitle>
              <CardDescription>Please review the details below before confirming.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Clinic:</h3>
                <p>{selectedClinic.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedClinic.address as Address).street}, {(selectedClinic.address as Address).barangay}, {(selectedClinic.address as Address).city}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Service:</h3>
                <p>{selectedService.name}</p>
              </div>
              <div>
                <h3 className="font-semibold">Date & Time:</h3>
                {/* Format the full date-time string from selectedTime */}
                <p>{selectedTime ? format(new Date(selectedTime), 'EEEE, MMMM dd, yyyy \'at\' h:mm a') : 'Not selected'}</p>
              </div>
              <Button onClick={handleConfirmBooking} disabled={isBooking} className="w-full">
                {isBooking ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </CardContent>
          </Card>
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="space-y-8">
      <Progress value={progressValue} className="w-full" />
      {renderStep()}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => Math.max(s - 1, 1))} disabled={step === 1}>
          Back
        </Button>
        {/* The 'Next' button is implicitly handled by the selections */}
      </div>
    </div>
  );
};

export default BookingWizard;