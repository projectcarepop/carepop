'use client';

import React, { useState } from 'react';
import ClinicList from './ClinicList';
import DynamicMapLoader from './DynamicMapLoader';
import ClinicDetailModal from './ClinicDetailModal';
import { Clinic } from '@/lib/types/clinic';
import { AlertTriangle, Loader2 } from 'lucide-react';
import LocationSearchInput from './LocationSearchInput';
import ServiceFilter from './ServiceFilter';
import SearchClinicsButton from './SearchClinicsButton';
import { Service } from '@/lib/types/service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ClinicFinderClientProps {
  initialClinics: Clinic[];
  initialServices: Service[];
  initialFetchError: string | null;
}

export default function ClinicFinderClient({ initialClinics, initialServices, initialFetchError: initialError }: ClinicFinderClientProps) {
  const [clinics, setClinics] = useState<Clinic[]>(initialClinics);
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClinicsByLocation = async ({ lat, lon }: { lat: number; lon: number }) => {
    setIsLoading(true);
    setError(null);
    setUserLocation({ lat, lon });

    try {
      const response = await fetch(`/api/v1/clinics?lat=${lat}&lon=${lon}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch clinics');
      }
      const data = await response.json();
      setClinics(data.data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetailsClick = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClinic(null);
  };

  const hasError = error || initialError;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full">
        <aside className="md:col-span-4 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <LocationSearchInput 
                  onLocationFound={fetchClinicsByLocation} 
                  onLocationError={setError} 
                />
              </div>
              <Separator />
              <div>
                <ServiceFilter services={initialServices} />
              </div>
              <div className="pt-2">
                <SearchClinicsButton />
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="md:col-span-8 lg:col-span-9 flex flex-col gap-8">
          {hasError ? (
            <Card className="flex-grow flex items-center justify-center p-6 bg-red-50 dark:bg-red-900/30">
              <div className="text-center">
                <AlertTriangle size={32} className="mx-auto mb-3 text-red-500" />
                <p className="text-red-700 dark:text-red-400 font-medium">Could not load clinic data.</p>
                <p className="text-sm text-red-600 dark:text-red-500">{error || initialError}</p>
              </div>
            </Card>
          ) : isLoading ? (
             <Card className="flex-grow flex items-center justify-center p-6">
              <div className="flex flex-col items-center gap-4">
                <Loader2 size={32} className="animate-spin text-pink-500" />
                <p className="text-lg font-medium">Finding clinics near you...</p>
              </div>
            </Card>
          ) : (
            <>
              <Card className="h-96 w-full overflow-hidden">
                <DynamicMapLoader clinics={clinics} />
              </Card>
              
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  {clinics.length > 0 ? 'Clinics Near You' : 'No Clinics Found'}
                </h2>
                <ClinicList 
                  clinics={clinics} 
                  userLocation={userLocation}
                  onViewDetails={handleViewDetailsClick} 
                />
              </div>
            </>
          )}
        </section>
      </div>
      
      <ClinicDetailModal 
        clinic={selectedClinic} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
} 