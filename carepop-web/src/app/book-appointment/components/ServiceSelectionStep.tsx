'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { BookingData } from '../page';
import { getPublicServices } from '@/services/api';

// Assuming a Service type, can be centralized later
interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
}

interface ServiceSelectionStepProps {
    onNext: () => void;
    updateBookingData: (data: Partial<BookingData>) => void;
}

export function ServiceSelectionStep({ onNext, updateBookingData }: ServiceSelectionStepProps) {
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

    const { data: services, isLoading, isError } = useQuery<Service[]>({
        queryKey: ['services'],
        queryFn: async () => {
            const res = await getPublicServices();
            return res.data || [];
        },
    });

    const handleSelectService = (service: Service) => {
        setSelectedServiceId(service.id);
        updateBookingData({ service: {id: service.id, name: service.name, price: service.price }});
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    Could not load services. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                {services?.map((service) => (
                    <button
                        key={service.id}
                        onClick={() => handleSelectService(service)}
                        className={`w-full p-4 border rounded-lg text-left transition-all flex justify-between items-center ${
                            selectedServiceId === service.id
                                ? 'border-primary ring-2 ring-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                    >
                        <div>
                            <h3 className="font-semibold text-lg">{service.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{service.description}</p>
                            <p className="font-bold text-primary mt-2">${service.price.toFixed(2)}</p>
                        </div>
                        {selectedServiceId === service.id && (
                            <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                        )}
                    </button>
                ))}
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={onNext} disabled={!selectedServiceId} size="lg">
                    Next: Choose Clinic
                </Button>
            </div>
        </div>
    );
} 