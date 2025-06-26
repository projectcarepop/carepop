'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { BookingData } from '../page';
import { getPublicClinics } from '@/services/api';

// Assuming a Clinic type, can be centralized later
interface Clinic {
    id: string;
    name: string;
    address: string;
}

interface ClinicSelectionStepProps {
    bookingData: BookingData;
    onNext: () => void;
    onBack: () => void;
    updateBookingData: (data: Partial<BookingData>) => void;
}

export function ClinicSelectionStep({ bookingData, onNext, onBack, updateBookingData }: ClinicSelectionStepProps) {
    const [selectedClinicId, setSelectedClinicId] = useState<string | null>(bookingData.clinic?.id || null);

    const { data: clinics, isLoading, isError } = useQuery<Clinic[]>({
        queryKey: ['clinics', bookingData.service?.id],
        queryFn: async () => {
            const res = await getPublicClinics(bookingData.service?.id);
            // The service function wraps the result in a 'data' property
            return res.data || [];
        },
        enabled: !!bookingData.service?.id, // Only run the query if a service is selected
    });

    const handleSelectClinic = (clinic: Clinic) => {
        setSelectedClinicId(clinic.id);
        updateBookingData({ clinic: {id: clinic.id, name: clinic.name }});
    };

    return (
        <div className="space-y-6">
             <div className="space-y-2">
                <p className="font-medium">Selected Service:</p>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 border rounded-lg">
                    <p className="font-semibold text-gray-700 dark:text-gray-300">{bookingData.service?.name}</p>
                </div>
            </div>

            {isLoading && (
                 <div className="space-y-4 pt-4">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                    ))}
                </div>
            )}

            {isError && (
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Could not load available clinics. Please try again later.
                    </AlertDescription>
                </Alert>
            )}
            
            <div className="space-y-4 pt-4">
                {clinics?.map((clinic) => (
                    <button
                        key={clinic.id}
                        onClick={() => handleSelectClinic(clinic)}
                        className={`w-full p-4 border rounded-lg text-left transition-all flex justify-between items-center ${
                            selectedClinicId === clinic.id
                                ? 'border-primary ring-2 ring-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                    >
                        <div>
                            <h3 className="font-semibold text-lg">{clinic.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{clinic.address}</p>
                        </div>
                        {selectedClinicId === clinic.id && (
                            <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                        )}
                    </button>
                ))}
            </div>

            <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={onBack}>
                    Back
                </Button>
                <Button onClick={onNext} disabled={!selectedClinicId} size="lg">
                    Next: Select Provider
                </Button>
            </div>
        </div>
    );
} 