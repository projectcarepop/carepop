'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ClinicSearch from '@/components/clinic-finder/ClinicSearch';
import ClinicResults from '@/components/clinic-finder/ClinicResults';

// Debounce hook from our project
import { useDebounce } from '@/hooks/useDebounce';

// Define a more specific type for our search results
export interface ClinicSearchResult {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    province: string;
    postal_code: string;
  } | null;
  phone_number: string | null;
  logo_url: string | null;
  location: string | null; // GeoJSON Point as string: "POINT(lon lat)"
  distance: number | null;
}


// API fetching function
const searchClinics = async (query: string, lat?: number, lon?: number): Promise<ClinicSearchResult[]> => {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (lat) params.append('lat', lat.toString());
  if (lon) params.append('lon', lon.toString());

  // This will hit the new backend endpoint
  const response = await fetch(`/api/public/search/clinics?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  // The address from the DB is a JSON object, ensure it's parsed if it's a string
  return data.map((clinic: any) => ({
      ...clinic,
      address: typeof clinic.address === 'string' ? JSON.parse(clinic.address) : clinic.address
  }));
};


const FindAClinicPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: results, isLoading, isError, refetch } = useQuery<ClinicSearchResult[]>({
    queryKey: ['clinics', debouncedSearchTerm, userLocation],
    queryFn: () => searchClinics(debouncedSearchTerm, userLocation?.lat, userLocation?.lon),
    enabled: !!debouncedSearchTerm || !!userLocation, // Only run query if there's a search term or location
  });
  
  const handleFindNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          // Clear search term when searching by location
          setSearchTerm('');
        },
        (error) => {
          console.error("Error getting user location:", error);
          alert("Could not get your location. Please ensure location services are enabled.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <ClinicSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onFindNearMe={handleFindNearMe}
      />
      <ClinicResults
        clinics={results ?? []}
        isLoading={isLoading}
        isError={isError}
        userLocation={userLocation}
      />
    </div>
  );
};

export default FindAClinicPage; 