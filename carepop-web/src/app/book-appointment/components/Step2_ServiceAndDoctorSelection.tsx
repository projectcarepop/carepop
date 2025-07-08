'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPublicServices, getProvidersForService, getPublicServiceCategories } from '@/services/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, X } from 'lucide-react';
import type { BookingData } from './BookingFlowManager';
import { type Service, type Doctor, type ServiceCategory } from '@/lib/types/bookings';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useDebounce } from 'use-debounce';
import { Button } from '@/components/ui/button';

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

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
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
            <div className="space-y-4">
                <Input 
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                    {isLoadingCategories ? <Loader2 className="h-5 w-5 animate-spin" /> :
                        categories?.map((cat: ServiceCategory) => (
                            <Button 
                                key={cat.id} 
                                variant={selectedCategoryId === cat.id ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategoryId(prev => prev === cat.id ? null : cat.id)}
                            >
                                {cat.name}
                            </Button>
                        ))
                    }
                </div>
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                        <X className="w-4 h-4 mr-2" />
                        Clear Filters
                    </Button>
                )}
            </div>
            <div className="border-b my-4" />

            <h3 className="font-semibold mb-2">Services</h3>
            {services && services.length > 0 ? (
            services.map((service: Service) => (
                <div
                key={service.id}
                className={cn(
                    "p-3 border rounded-md cursor-pointer hover:bg-accent",
                    bookingData.service?.id === service.id && "ring-2 ring-primary"
                )}
                onClick={() => handleSelectService(service)}
                >
                <h4 className="font-semibold">{service.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                <p className="text-sm font-bold mt-2">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(service.price)}
                </p>
                </div>
            ))
            ) : (
            <p className="text-muted-foreground text-center text-sm">No services found for this clinic.</p>
            )}
        </div>

        {/* --- Doctors Column --- */}
        <div className="flex flex-col gap-3">
            <h3 className="font-semibold mb-2">Professionals</h3>
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
                    doctors.map((doctor: Doctor) => (
                    <div
                        key={doctor.id}
                        className={cn(
                            "p-3 border rounded-md cursor-pointer hover:bg-accent flex items-center gap-4",
                            bookingData.doctor?.id === doctor.id && "ring-2 ring-primary"
                        )}
                        onClick={() => handleSelectDoctor(doctor)}
                    >
                        <img src={doctor.avatarUrl || '/avatar-placeholder.png'} alt={doctor.fullName} className="w-14 h-14 rounded-full bg-muted" />
                        <div>
                        <h4 className="font-semibold">{doctor.fullName}</h4>
                        <p className="text-sm text-muted-foreground">{doctor.specialtyText}</p>
                        </div>
                    </div>
                    ))
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