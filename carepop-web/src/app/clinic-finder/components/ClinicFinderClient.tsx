'use client';

import React, { useState, useEffect } from 'react';
import ClinicList from './ClinicList';
import DynamicMapLoader from './DynamicMapLoader';
import ClinicDetailModal from './ClinicDetailModal';
import { Clinic } from '@/lib/types/clinic';
import { AlertTriangle } from 'lucide-react';
import LocationSearchInput from './LocationSearchInput';
import ServiceFilter from './ServiceFilter';
import SearchClinicsButton from './SearchClinicsButton';

interface ClinicFinderClientProps {
  initialClinics: Clinic[];
  initialFetchError: string | null;
}

export default function ClinicFinderClient({ initialClinics, initialFetchError }: ClinicFinderClientProps) {
  const [clinics, setClinics] = useState<Clinic[]>(initialClinics);
  const [fetchError, setFetchError] = useState<string | null>(initialFetchError);
  // isLoading is no longer managed here, as data is pre-fetched by the Server Component parent

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If you add client-side filtering/searching that refetches or modifies 'clinics',
  // that logic would go into a useEffect here or similar client-side data handling.
  // For now, we assume initialClinics is the complete set for display.

  const handleViewDetailsClick = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClinic(null);
  };

  return (
    <>
      {/* Container and Header are now part of the parent page.tsx */}
      {/* We only render the parts that depend on client-side state or interactivity */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-3 space-y-6 p-4 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white border-b pb-3 mb-4">
            Search Filters
          </h2>
          <LocationSearchInput />
          <ServiceFilter />
          <div className="pt-4">
            <SearchClinicsButton />
          </div>
        </aside>

        <section className="lg:col-span-9 space-y-8">
          {fetchError ? (
            <div className="p-6 border rounded-lg bg-red-50 dark:bg-red-900/30 text-center shadow-sm">
              <AlertTriangle size={32} className="mx-auto mb-3 text-red-500" />
              <p className="text-red-700 dark:text-red-400 font-medium">Could not load clinic data.</p>
              <p className="text-sm text-red-600 dark:text-red-500">{fetchError}</p>
            </div>
          ) : (
            <>
              <div className="h-96 w-full border rounded-lg bg-gray-100 dark:bg-gray-700 shadow-sm overflow-hidden">
                <DynamicMapLoader clinics={clinics} /> 
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Nearby Clinics</h2>
                <ClinicList clinics={clinics} onViewDetails={handleViewDetailsClick} />
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