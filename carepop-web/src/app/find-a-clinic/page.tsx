'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, DirectionsRenderer } from '@react-google-maps/api';
import { searchClinics } from '@/services/api';
import { type Clinic } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Navigation, Loader2, MapPin, X, Search, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 12.8797, lng: 121.7740 }; // Philippine archipelago center
const googleMapsLibraries: ["places"] = ["places"];
const RADIUS_OPTIONS_KM = [5, 10, 25, 50, 100];
const DEFAULT_RADIUS_KM = 25;

interface ClinicFilters {
  userLocation: { lat: number; lon: number } | null;
  radius: number | null; // in meters
}

function FindAClinicClient() {
  const [filters, setFilters] = useState<ClinicFilters>({
    userLocation: null,
    radius: null,
  });
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [userMarker, setUserMarker] = useState<{ lat: number; lng: number } | null>(null);
  
  // State for Directions
  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const [destination, setDestination] = useState<google.maps.LatLngLiteral | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // State for Radius Slider
  const [sliderValue, setSliderValue] = useState([DEFAULT_RADIUS_KM]);
  const debouncedRadius = useDebounce(sliderValue[0], 500);

  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();
  const mapRef = React.useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: googleMapsLibraries,
  });

  const { data: clinics = [], isLoading: isLoadingClinics } = useQuery<Clinic[]>({
    queryKey: ['clinics', filters],
    queryFn: () => searchClinics(filters),
    enabled: isLoaded,
  });

  // --- Radius Filter Logic ---
  useEffect(() => {
    if (filters.userLocation) {
      setFilters(prev => ({ ...prev, radius: debouncedRadius * 1000 }))
    }
  }, [debouncedRadius, filters.userLocation]);

  // --- Directions Logic ---
  const handleGetDirectionsClick = useCallback(() => {
    if (!userMarker) {
      toast({
        title: "Your location is not set",
        description: "Click 'Find Near Me' to set your starting point first.",
      });
      return;
    }
    if (!selectedClinic?.latitude || !selectedClinic?.longitude) return;

    setOrigin(userMarker);
    setDestination({ lat: selectedClinic.latitude, lng: selectedClinic.longitude });
    setSelectedClinic(null); // Close info window
  }, [userMarker, selectedClinic, toast]);

  const handleClearDirections = () => {
    setDirectionsResponse(null);
    setOrigin(null);
    setDestination(null);
  };

  useEffect(() => {
    if (!origin || !destination) return;
    const directionsService = new window.google.maps.DirectionsService();
    setIsCalculatingRoute(true);
    setDirectionsResponse(null);

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setIsCalculatingRoute(false);
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          setDirectionsResponse(result);
        } else {
          toast({
            title: "Directions Error",
            description: "A route could not be calculated. The destination may be unreachable.",
            variant: "destructive",
          });
          handleClearDirections();
        }
      }
    );
  }, [origin, destination, toast]);


  // --- Location & Filter Logic ---
  const handleFindNearMe = () => {
    setIsLocating(true);
    handleClearDirections(); 
    if (!navigator.geolocation) {
      setIsLocating(false);
      toast({ title: "Geolocation Not Supported", variant: "destructive" });
      return;
    }
    
    // Explicitly define high-accuracy options
    const options: PositionOptions = { 
      enableHighAccuracy: true, 
      timeout: 10000, 
      maximumAge: 0 
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPos = { lat: position.coords.latitude, lon: position.coords.longitude };
        setFilters(prev => ({ ...prev, userLocation: newPos, radius: sliderValue[0] * 1000 }));
        setUserMarker({ lat: newPos.lat, lng: newPos.lon });
        if (mapRef.current) {
          mapRef.current.panTo({lat: newPos.lat, lng: newPos.lon});
          mapRef.current.setZoom(10);
        }
        setIsLocating(false);
        toast({ title: "Location Found", description: "Clinics sorted by nearest to you." });
      },
      (err) => {
        setIsLocating(false);
        toast({ title: "Location Error", description: err.message, variant: "destructive" });
      },
      options // Pass the high-accuracy options here
    );
  };
  
  const handleClearLocationSort = () => {
    handleClearDirections();
    setFilters(prev => ({ ...prev, userLocation: null, radius: null }));
    setUserMarker(null);
  }

  const handleListSelect = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    if (mapRef.current && clinic.latitude && clinic.longitude) {
      mapRef.current.panTo({ lat: clinic.latitude, lng: clinic.longitude });
      mapRef.current.setZoom(14);
    }
  };

  const onMapLoad = useCallback((map: google.maps.Map) => { mapRef.current = map; }, []);
  const onUnmount = useCallback(() => { mapRef.current = null; }, []);

  const InfoPanel = () => {
    if (isCalculatingRoute) {
        return <Alert><Loader2 className="h-4 w-4 animate-spin mr-2" /><AlertTitle>Calculating Route...</AlertTitle></Alert>;
    }
    if (directionsResponse && directionsResponse.routes[0]) {
        const route = directionsResponse.routes[0].legs[0];
        return (
            <Alert>
                <AlertTitle>{route.distance?.text} ({route.duration?.text})</AlertTitle>
                <AlertDescription className='mt-2'>
                    <span className='font-semibold'>From:</span> {route.start_address.split(',')[0]}<br />
                    <span className='font-semibold'>To:</span> {route.end_address.split(',')[0]}
                </AlertDescription>
                <Button onClick={handleClearDirections} variant="link" size="sm" className="p-0 h-auto mt-2 font-semibold">Clear Route</Button>
            </Alert>
        )
    }
    return (
        <Alert>
            <Search className="h-4 w-4 -translate-y-0.5" />
            <AlertTitle>Find a Clinic</AlertTitle>
            <AlertDescription>Select a clinic on the map or use the &quot;Find Near Me&quot; button to begin.</AlertDescription>
        </Alert>
    )
  }

  if (loadError) return <div className="p-4 text-center">Error loading maps.</div>;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)]">
      <div className="w-full md:w-1/3 p-4 overflow-y-auto bg-white shadow-lg flex flex-col space-y-4">
        <InfoPanel />
        
        <div className='space-y-4'>
            <Button onClick={handleFindNearMe} disabled={isLocating} className="w-full">
              {isLocating ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <MapPin className="h-4 w-4 mr-2"/>}
              Find Near Me & Sort
            </Button>

            {filters.userLocation && (
              <div className="space-y-3 pt-2">
                <div className='flex justify-between items-center'>
                    <Label htmlFor="radius" className='text-sm font-medium'>Search Radius: <span className='font-bold text-blue-600'>{sliderValue[0]}km</span></Label>
                    <Button onClick={handleClearLocationSort} variant="link" size="sm" className="text-xs h-auto p-0">
                        <X className="h-3 w-3 mr-1"/> Clear Location
                    </Button>
                </div>
                <Slider
                  id="radius"
                  min={RADIUS_OPTIONS_KM[0]}
                  max={RADIUS_OPTIONS_KM[RADIUS_OPTIONS_KM.length - 1]}
                  step={5}
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  className="w-full"
                />
              </div>
            )}
        </div>
        
        {!directionsResponse && (
          <div className="flex-grow overflow-y-auto space-y-3 border-t pt-4">
              {isLoadingClinics ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
              : clinics.length > 0 ? clinics.map((clinic) => (
                      <Card key={clinic.id} className="cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleListSelect(clinic)}>
                        <CardHeader className="pb-2 px-4 pt-3">
                          <CardTitle className="text-base font-semibold leading-tight">{clinic.name}</CardTitle>
                        </CardHeader>
                                                 <CardContent className="px-4 pb-3 pt-0">
                           <p className="text-sm text-gray-600 leading-snug">
                             {(() => {
                               // Check if clinic has any address property (cast to any to access all possible fields)
                               const c = clinic as any;
                               
                               // Option 1: Use full_address if available (Supabase format)
                               if (c.full_address) {
                                 return c.full_address;
                               }
                               
                               // Option 2: Build from individual Supabase fields
                               if (c.street_address || c.locality || c.region) {
                                 const parts = [c.street_address, c.locality, c.region].filter(Boolean);
                                 return parts.length > 0 ? parts.join(', ') : 'Address not available';
                               }
                               
                               // Option 3: Handle address as JSONB object (Drizzle format)
                               if (c.address && typeof c.address === 'object') {
                                 const addr = c.address;
                                 const parts = [addr.street, addr.city || addr.cityMunicipality, addr.province].filter(Boolean);
                                 return parts.length > 0 ? parts.join(', ') : 'Address not available';
                               }
                               
                               // Option 4: Handle individual address fields (legacy format)
                               if (c.street || c.cityMunicipality) {
                                 const cityName = typeof c.cityMunicipality === 'string' 
                                   ? c.cityMunicipality 
                                   : c.cityMunicipality?.name;
                                 return [c.street, cityName].filter(Boolean).join(', ');
                               }
                               
                               return 'Address not available';
                             })()}
                           </p>
                           {clinic.distance && (
                             <p className="text-xs text-blue-600 font-medium mt-1">
                               {(clinic.distance / 1000).toFixed(2)} km away
                             </p>
                           )}
                         </CardContent>
                      </Card>
                  ))
              : <div className="text-center text-gray-500 py-10"><p>No clinics found for the selected criteria.</p></div>
              }
          </div>
        )}
      </div>
      
      <div className="w-full md:w-2/3 h-full">
        {!isLoaded ? <div className='w-full h-full flex justify-center items-center'><Loader2 className='h-10 w-10 animate-spin'/></div>
         : <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={6} onLoad={onMapLoad} onUnmount={onUnmount} options={{ streetViewControl: false, mapTypeControl: false, gestureHandling: 'greedy' }}>
              
              {!directionsResponse && clinics.map((clinic) => (
                  clinic.latitude && clinic.longitude && (
                    <MarkerF key={clinic.id} position={{ lat: clinic.latitude, lng: clinic.longitude }} onClick={() => setSelectedClinic(clinic)} />
                  )
              ))}

              {!directionsResponse && userMarker && (
                <MarkerF position={userMarker} icon={{ url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='#4285F4'><circle cx='12' cy='12' r='10' fill='white' stroke='#4285F4' stroke-width='0.5'/><circle cx='12' cy='12' r='6' fill='#4285F4'/></svg>`)}`, scaledSize: new window.google.maps.Size(30, 30),}} zIndex={10} />
              )}
              
              {!directionsResponse && selectedClinic && selectedClinic.latitude && selectedClinic.longitude && (
                  <InfoWindowF position={{ lat: selectedClinic.latitude, lng: selectedClinic.longitude }} onCloseClick={() => setSelectedClinic(null)} zIndex={1}>
                      <div className="p-1 max-w-xs space-y-2">
                          <h4 className="font-bold text-md">{selectedClinic.name}</h4>
                                                     <p className="text-sm">
                             {(() => {
                               // Check if clinic has any address property (cast to any to access all possible fields)
                               const c = selectedClinic as any;
                               
                               // Option 1: Use full_address if available (Supabase format)
                               if (c.full_address) {
                                 return c.full_address;
                               }
                               
                               // Option 2: Build from individual Supabase fields
                               if (c.street_address || c.locality) {
                                 const parts = [c.street_address, c.locality].filter(Boolean);
                                 return parts.length > 0 ? parts.join(', ') : 'Address not available';
                               }
                               
                               // Option 3: Handle address as JSONB object (Drizzle format)
                               if (c.address && typeof c.address === 'object') {
                                 const addr = c.address;
                                 const parts = [addr.street, addr.city || addr.cityMunicipality].filter(Boolean);
                                 return parts.length > 0 ? parts.join(', ') : 'Address not available';
                               }
                               
                               // Option 4: Handle individual address fields (legacy format)
                               if (c.street || c.cityMunicipality) {
                                 const cityName = typeof c.cityMunicipality === 'string' 
                                   ? c.cityMunicipality 
                                   : c.cityMunicipality?.name;
                                 return [c.street, cityName].filter(Boolean).join(', ');
                               }
                               
                               return 'Address not available';
                             })()}
                           </p>
                          <div className="flex gap-2">
                            <Button onClick={handleGetDirectionsClick} size="sm" disabled={!userMarker}><Navigation className="h-4 w-4 mr-2"/> Directions</Button>
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/clinic/${selectedClinic.id}`}>View Details <ExternalLink className="h-4 w-4 ml-2"/></Link>
                            </Button>
                          </div>
                          {!userMarker && <p className='text-xs text-gray-500 mt-1'>Use &quot;Find Near Me&quot; to enable directions.</p>}
                      </div>
                  </InfoWindowF>
              )}

              {directionsResponse && (
                <DirectionsRenderer directions={directionsResponse} />
              )}

          </GoogleMap>
        }
      </div>
    </div>
  );
}

export default function FindAClinicPage() {
    return <FindAClinicClient />;
} 