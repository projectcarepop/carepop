'use client';

import { useQuery } from '@tanstack/react-query';
import { getPublicClinics } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, MapPin } from 'lucide-react';
import type { Clinic } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formatAddress = (address: Clinic['address']) => {
    if (!address) return 'No address provided';
    const parts = [
        address.street,
        address.barangay,
        address.city,
        address.province,
        address.postal_code,
    ];
    return parts.filter(Boolean).join(', ');
};

interface Step1_ClinicSelectionProps {
    onClinicSelect: (clinic: Clinic) => void;
}

export function Step1_ClinicSelection({ onClinicSelect }: Step1_ClinicSelectionProps) {
    const router = useRouter();
    const { data: clinics, isLoading, isError } = useQuery<Clinic[], Error>({
        queryKey: ['publicClinics'],
        queryFn: () => getPublicClinics(),
        select: (data: any) => data.data, // The API wraps the array in a data property
    });

    const handleViewOnMap = (clinicId: string) => {
        router.push(`/find-a-clinic?clinicId=${clinicId}`);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Could not fetch clinics. Please try again later.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Select a Clinic</h2>
                <p className="text-muted-foreground">Choose where you&apos;d like to set your appointment.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clinics?.map((clinic: Clinic) => (
                    <Card key={clinic.id} className="flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle>{clinic.name}</CardTitle>
                            <CardDescription>{formatAddress(clinic.address)}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-2">
                             <Button className="w-full" onClick={() => onClinicSelect(clinic)}>
                                Select
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleViewOnMap(clinic.id)}
                            >
                                <MapPin className="mr-2 h-4 w-4" /> View on Map
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 