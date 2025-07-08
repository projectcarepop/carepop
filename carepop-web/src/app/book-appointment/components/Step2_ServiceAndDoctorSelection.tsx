'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPublicServices, getProvidersForService, getPublicServiceCategories } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, X, Clock, Stethoscope, CheckCircle2 } from 'lucide-react';
import type { BookingData } from './BookingFlowManager';
import { type Service, type Doctor, type ServiceCategory } from '@/lib/types/bookings';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useDebounce } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Step2_ServiceAndDoctorSelectionProps {
  bookingData: BookingData;
  updateBookingData: (data: Partial<BookingData>) => void;
  setSelectionMade: (isSelected: boolean) => void;
}

export const Step2_ServiceAndDoctorSelection: React.FC<Step2_ServiceAndDoctorSelectionProps> = ({
  bookingData,
  updateBookingData,
  setSelectionMade,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const { data: categories, isLoading: isLoadingCategories } = useQuery<ServiceCategory[]>({
    queryKey: ['serviceCategories'],
    queryFn: getPublicServiceCategories,
  });

  const {
    data: services,
    isLoading: isLoadingServices,
    isError,
    error,
  } = useQuery({
    queryKey: ['clinicServices', bookingData.clinic?.id, selectedCategoryId, debouncedSearchTerm],
    queryFn: () => getPublicServices({
      clinicId: bookingData.clinic!.id,
      categoryId: selectedCategoryId ?? undefined,
      q: debouncedSearchTerm,
    }),
    enabled: !!bookingData.clinic?.id,
  });

  const {
    data: doctors,
    isLoading: isLoadingDoctors,
  } = useQuery({
    queryKey: ['providersForService', selectedServiceId, bookingData.clinic?.id],
    queryFn: () => getProvidersForService(selectedServiceId!, bookingData.clinic!.id),
    enabled: !!selectedServiceId && !!bookingData.clinic?.id,
    select: (data) => data.data,
  });

  const handleSelectService = (service: Service) => {
    setSelectedServiceId(service.id);
    updateBookingData({ service, doctor: undefined });
    setSelectionMade(false);
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    const service = services?.find((s: Service) => s.id === selectedServiceId);
    if (!service) return;
    updateBookingData({ service, doctor });
    setSelectionMade(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategoryId(null);
  }

  const hasActiveFilters = searchTerm || selectedCategoryId;

  if (isLoadingServices) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading Services...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was a problem fetching services for this clinic.
          {error && <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Select a Service & Doctor at {bookingData.clinic?.name}</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm pt-1">
          First choose a service, then select an available professional.
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
        {/* --- Services Column --- */}
        <div className="flex flex-col gap-3 pr-4 border-r">
            <div className="space-y-3">
                <Input 
                    placeholder="Search services by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                    onValueChange={(value) => setSelectedCategoryId(value === 'all' ? null : value)}
                    value={selectedCategoryId || 'all'}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Filter by category..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {isLoadingCategories ? <Loader2 className="h-5 w-5 animate-spin mx-auto my-2" /> :
                            categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground h-8 px-2">
                        <X className="w-4 h-4 mr-1" />
                        Clear
                    </Button>
                )}
            </div>
            <div className="border-b my-2" />
            <ScrollArea className="h-96 -mr-3">
                <div className="p-4 space-y-2">
                    <h3 className="font-semibold mb-2 text-lg">Services</h3>
                    {services && services.length > 0 ? (
                    services.map((service: Service) => {
                        const isSelected = bookingData.service?.id === service.id;
                        return (
                            <div
                            key={service.id}
                            className={cn(
                                "p-4 border rounded-lg cursor-pointer hover:bg-accent relative",
                                isSelected && "ring-2 ring-primary bg-primary/5"
                            )}
                            onClick={() => handleSelectService(service)}
                            >
                                {isSelected && (
                                    <CheckCircle2 className="w-5 h-5 text-primary absolute top-3 right-3" />
                                )}
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-base pr-2">{service.name}</h4>
                                    <p className="text-sm font-semibold text-primary">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(service.price)}
                                    </p>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 my-2">{service.description}</p>
                                <div className="flex items-center text-xs text-muted-foreground mt-2">
                                    <Clock className="w-3 h-3 mr-1.5" />
                                    <span>{service.durationMinutes} minutes</span>
                                </div>
                            </div>
                        )
                    })
                    ) : (
                    <p className="text-muted-foreground text-center text-sm pt-10">No services found for this clinic.</p>
                    )}
                </div>
            </ScrollArea>
        </div>

        {/* --- Doctors Column --- */}
        <div className="flex flex-col gap-3">
            <h3 className="font-semibold mb-2 text-lg">Professionals</h3>
            {!selectedServiceId ? (
                <div className="text-center text-muted-foreground pt-10">
                    <p>Please select a service to see available professionals.</p>
                </div>
            ) : isLoadingDoctors ? (
                <div className="flex items-center justify-center pt-10">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    <span>Loading...</span>
                </div>
            ) : (
                <>
                {doctors && doctors.length > 0 ? (
                    doctors.map((doctor: Doctor) => {
                        const isSelected = bookingData.doctor?.id === doctor.id;
                        return (
                        <div
                            key={doctor.id}
                            className={cn(
                                "p-3 border rounded-lg cursor-pointer hover:bg-accent flex items-center gap-4 relative",
                                isSelected && "ring-2 ring-primary bg-primary/5"
                            )}
                            onClick={() => handleSelectDoctor(doctor)}
                        >
                            {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-primary absolute top-2 right-2" />
                            )}
                            <Avatar className="w-14 h-14">
                                <AvatarImage src={doctor.avatarUrl || ''} alt={doctor.fullName} />
                                <AvatarFallback>{doctor.fullName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h4 className="font-semibold text-base">{doctor.fullName}</h4>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <Stethoscope className="w-4 h-4 mr-1.5" />
                                    <span>{doctor.specialtyText}</span>
                                </div>
                            </div>
                        </div>
                        )
                    })
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No professionals are available for this service.</p>
                    </div>
                )}
                </>
            )}
        </div>
      </CardContent>
    </Card>
  );
}; 