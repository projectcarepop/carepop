import React from 'react';
import { getPublicClinicDetails } from '@/services/api';
import { notFound } from 'next/navigation';
import ClinicDetailClient from './_components/ClinicDetailClient';
import { type Clinic } from '@/lib/types';

// Define the props interface right above the component
interface PageProps {
    params: {
        clinicId: string;
    };
}

export default async function ClinicDetailPage({ params: { clinicId } }: PageProps) {
    // The clinicId is now directly available.
    
    const clinic: Clinic | null = await getPublicClinicDetails(clinicId);

    if (!clinic) {
        // You can use Next.js's notFound() helper for a standard 404 page
        notFound();
    }

    return <ClinicDetailClient clinic={clinic} />;
} 