'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { getPublicClinics, getPublicServiceCategories, getPublicServices, getNearbyClinics } from '@/services/api';
import { type Clinic, type ServiceCategory, type AdminService } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Navigation, LocateFixed } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const googleMapsLibraries: ["places"] = ["places"];

// --- Main Client Component ---
function FindAClinicClient() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [activeClinic, setActiveClinic] = useState<Clinic | null>(null);
  const [userClinics, setUserClinics] = useState<Clinic[] | null>(null); // State for location-based search
  const [searchRadius, setSearchRadius] = useState<number>(25); // In km, default 25
  const mapRef = useRef<google.maps.Map | null>(null);
  const { toast } = useToast();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: googleMapsLibraries,
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // --- Data Fetching ---
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<ServiceCategory[], Error, ServiceCategory[]>({
    queryKey: ['publicServiceCategories'],
    queryFn: getPublicServiceCategories,
    select: (response: any) => response.data || [],
  });

  const { data: allServices = [] } = useQuery<AdminService[], Error, AdminService[]>({
    queryKey: ['publicServices'],
    queryFn: () => getPublicServices(),
    select: (response: any) => response.data || [],
  });

  const { data: clinics = [], isLoading: isLoadingClinics } = useQuery<Clinic[], Error, Clinic[]>({
    queryKey: ['publicClinics', selectedServiceId],
    queryFn: () => getPublicClinics(selectedServiceId || undefined),
    enabled: isLoaded, // Only fetch clinics once the map is ready
    select: (response: any) => response.data || [],
  });

  const { mutate: findNearby, isPending: isFindingLocation } = useMutation({
    mutationFn: ({ lat, lon, radius }: { lat: number; lon: number; radius: number }) => getNearbyClinics(lat, lon, radius * 1000), // Convert km to meters
    onSuccess: (response: any) => {
      const nearbyClinics = response.data || [];
      setUserClinics(nearbyClinics);
      toast({
        title: "Location Search Complete",
        description: `Found ${nearbyClinics.length} clinics near you.`,
      });

      if (nearbyClinics.length > 0 && mapRef.current) {
        // Pan to the first clinic in the list
        mapRef.current.panTo({ lat: nearbyClinics[0].latitude, lng: nearbyClinics[0].longitude });
        mapRef.current.setZoom(12); // Zoom in closer
      } else if (mapRef.current) {
        // If no clinics, we can still pan to the user's location if we have it
        // For simplicity, we don't handle this case yet.
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Could not fetch nearby clinics. Please try again.",
        variant: "destructive",
      });
      console.error("Error fetching nearby clinics:", error);
    }
  });

  // --- Derived State ---
  // Display user-located clinics if available, otherwise fall back to filter-based results
  const clinicsToDisplay = userClinics ?? clinics;

  // --- Memoized Filtering for Cascading Dropdown ---
  const filteredServices = useMemo(() => {
    if (!selectedCategoryId) return [];
    return allServices.filter(service => service.serviceCategory?.id === selectedCategoryId);
  }, [selectedCategoryId, allServices]);

  // --- Event Handlers ---
  const handleCategoryChange = (categoryId: string) => {
    setUserClinics(null); // Clear location search results
    setSelectedCategoryId(categoryId);
    setSelectedServiceId(null); // Reset service when category changes
  };

  const handleServiceChange = (serviceId: string) => {
    setUserClinics(null); // Clear location search results
    setSelectedServiceId(serviceId);
  };
  
  const handleClearFilters = () => {
    setUserClinics(null); // Clear location search results
    setSelectedCategoryId(null);
    setSelectedServiceId(null);
  };
  
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        findNearby({ lat: latitude, lon: longitude, radius: searchRadius });
        if (mapRef.current) {
          mapRef.current.panTo({ lat: latitude, lng: longitude });
          mapRef.current.setZoom(10); // Adjust zoom for context
        }
      },
      () => {
        toast({
          title: "Location Access Denied",
          description: "Please enable location services in your browser settings to use this feature.",
          variant: "destructive",
        });
      }
    );
  };

  const handleRadiusChange = (value: number[]) => {
    const newRadius = value[0];
    setSearchRadius(newRadius);
    // If we have user clinics, re-run the search with the new radius
    if (userClinics) {
        handleUseMyLocation();
    }
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
            <Select onValueChange={handleServiceChange} value={selectedServiceId || ''} disabled={!selectedCategoryId}>
              <SelectTrigger><SelectValue placeholder="2. Select a Service" /></SelectTrigger>
              <SelectContent>
                {filteredServices.length > 0 ? filteredServices.map(service => (
                  <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                )) : <SelectItem value="none" disabled>No services in this category</SelectItem>}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleClearFilters} variant="ghost">Clear Filters</Button>
                <Button onClick={handleUseMyLocation} disabled={isFindingLocation}>
                    <LocateFixed className="h-4 w-4 mr-2" />
                    {isFindingLocation ? 'Locating...' : 'Use My Location'}
                </Button>
            </div>
            {userClinics !== null && (
                <div className="pt-4 space-y-2">
                    <Label htmlFor="radius-slider">Search Radius: {searchRadius} km</Label>
                    <Slider
                        id="radius-slider"
                        min={1}
                        max={100}
                        step={1}
                        value={[searchRadius]}
                        onValueChange={handleRadiusChange}
                    />
                </div>
            )}
        </div>
        
        {/* --- Clinic List --- */}
        <div className="flex-grow overflow-y-auto space-y-3">
            {isLoadingClinics || isFindingLocation ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
            ) : clinicsToDisplay.length > 0 ? (
                clinicsToDisplay.map((clinic) => (
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
                    {userClinics === null ? (
                      <p className="text-sm">Try clearing the filters to see all clinics.</p>
                    ) : (
                      <p className="text-sm">There are no clinics within a {searchRadius}km radius of your location.</p>
                    )}
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
              onLoad={onMapLoad}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={{ lat: 12.8797, lng: 121.7740 }} // Default to Philippines center
              zoom={6}
          >
              {clinicsToDisplay.map((clinic) => (
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
export default function FindAClinicPage() {
    return <FindAClinicClient />;
} 