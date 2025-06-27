'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { getPublicClinics, getPublicServiceCategories, getPublicServices } from '@/services/api';
import { type Clinic, type ServiceCategory, type AdminService } from '@/lib/types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Components that are part of the page layout but don't require client interactivity directly here
// import LocationSearchInput from './components/LocationSearchInput'; 
// import ServiceFilter from './components/ServiceFilter';
// import SearchClinicsButton from './components/SearchClinicsButton';
// The above will be rendered by ClinicFinderClient.tsx

// --- Main Client Component ---
function ClinicFinderClient() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [activeClinic, setActiveClinic] = useState<Clinic | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  // --- Data Fetching ---
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<ServiceCategory[]>({
    queryKey: ['publicServiceCategories'],
    queryFn: getPublicServiceCategories,
  });

  const { data: allServices = [], isLoading: isLoadingServices } = useQuery<AdminService[]>({
    queryKey: ['publicServices'],
    queryFn: getPublicServices,
  });

  const { data: clinics = [], isLoading: isLoadingClinics } = useQuery<Clinic[]>({
    queryKey: ['publicClinics', selectedServiceId],
    queryFn: () => getPublicClinics(selectedServiceId),
    enabled: isLoaded, // Only fetch clinics once the map is ready
  });

  // --- Memoized Filtering for Cascading Dropdown ---
  const filteredServices = useMemo(() => {
    if (!selectedCategoryId) return [];
    return allServices.filter(service => service.serviceCategory?.id === selectedCategoryId);
  }, [selectedCategoryId, allServices]);

  // --- Event Handlers ---
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedServiceId(null); // Reset service when category changes
  };
  
  const handleClearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedServiceId(null);
  };
  
  if (loadError) return <div className="p-4 text-center">Error loading maps. Please check your API key and network connection.</div>;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)]"> {/* Adjust height based on header */}
      {/* --- Controls & List Panel --- */}
      <div className="w-full md:w-1/3 p-4 overflow-y-auto bg-white shadow-lg flex flex-col">
        <h1 className="text-2xl font-bold mb-4">Find a Clinic</h1>
        <div className="space-y-4 mb-4 pb-4 border-b">
            <Select onValueChange={handleCategoryChange} value={selectedCategoryId || ''}>
              <SelectTrigger><SelectValue placeholder="1. Select a Service Category" /></SelectTrigger>
              <SelectContent>
                {isLoadingCategories ? <SelectItem value="loading" disabled>Loading...</SelectItem> : categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedServiceId} value={selectedServiceId || ''} disabled={!selectedCategoryId}>
              <SelectTrigger><SelectValue placeholder="2. Select a Service" /></SelectTrigger>
              <SelectContent>
                {filteredServices.length > 0 ? filteredServices.map(service => (
                  <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                )) : <SelectItem value="none" disabled>No services in this category</SelectItem>}
              </SelectContent>
            </Select>
            <Button onClick={handleClearFilters} variant="ghost" className="w-full">Clear Filters</Button>
        </div>
        
        {/* --- Clinic List --- */}
        <div className="flex-grow overflow-y-auto space-y-3">
            {isLoadingClinics ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
            ) : clinics.length > 0 ? (
                clinics.map((clinic) => (
                    <Card key={clinic.id} className="cursor-pointer hover:bg-gray-100" onClick={() => setActiveClinic(clinic)}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">{clinic.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 text-sm text-gray-600">
                        {clinic.address?.street}, {clinic.address?.city}
                      </CardContent>
                    </Card>
                ))
            ) : (
                <div className="text-center text-gray-500 py-10">
                    <p>No clinics found.</p>
                    <p className="text-sm">Try clearing the filters to see all clinics.</p>
                </div>
            )}
        </div>
      </div>
      
      {/* --- Map Panel --- */}
      <div className="w-full md:w-2/3 h-full">
        {!isLoaded ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={{ lat: 12.8797, lng: 121.7740 }} // Default to Philippines center
              zoom={6}
          >
              {clinics.map((clinic) => (
                  <Marker 
                      key={clinic.id} 
                      position={{ lat: clinic.latitude, lng: clinic.longitude }}
                      onClick={() => setActiveClinic(clinic)}
                  />
              ))}
              {activeClinic && (
                  <InfoWindow
                      position={{ lat: activeClinic.latitude, lng: activeClinic.longitude }}
                      onCloseClick={() => setActiveClinic(null)}
                  >
                      <div className="p-1 max-w-xs">
                          <h4 className="font-bold text-md mb-1">{activeClinic.name}</h4>
                          <p className="text-sm mb-2">{activeClinic.address?.street}</p>
                          <Button asChild size="sm">
                              <a href={`https://www.google.com/maps/dir/?api=1&destination=${activeClinic.latitude},${activeClinic.longitude}`} target="_blank" rel="noopener noreferrer">
                                  <Navigation className="h-4 w-4 mr-2"/> Get Directions
                              </a>
                          </Button>
                      </div>
                  </InfoWindow>
              )}
          </GoogleMap>
        )}
      </div>
    </div>
  );
}

// The page is now just a wrapper for the client component.
export default function ClinicFinderPage() {
    return <ClinicFinderClient />;
} 