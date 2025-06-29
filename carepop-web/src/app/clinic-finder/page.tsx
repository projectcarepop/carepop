'use client';

import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { searchClinics, getPublicServices } from '@/services/api';
import { type Clinic, type AdminService } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigation, Loader2, MapPin, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 12.8797, lng: 121.7740 };

interface ClinicFilters {
  serviceId: string | null;
  userLocation: { lat: number; lon: number } | null;
}

function ClinicFinderClient() {
  const [filters, setFilters] = useState<ClinicFilters>({ serviceId: null, userLocation: null });
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [userMarker, setUserMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();
  const mapRef = React.useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const { data: services = [], isLoading: isLoadingServices } = useQuery<AdminService[]>({
    queryKey: ['publicServices'],
    queryFn: getPublicServices,
    enabled: isLoaded,
  });

  const { data: clinics = [], isLoading: isLoadingClinics } = useQuery<Clinic[]>({
    queryKey: ['clinics', filters],
    queryFn: () => searchClinics(filters),
    enabled: isLoaded,
  });

  const handleGetDirections = useCallback(() => {
    if (!selectedClinic?.latitude || !selectedClinic?.longitude) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedClinic.latitude},${selectedClinic.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [selectedClinic]);

  const handleFindNearMe = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setIsLocating(false);
      toast({ title: "Geolocation Not Supported", variant: "destructive" });
      return;
    }
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newPos = { lat: position.coords.latitude, lon: position.coords.longitude };
        setFilters(prev => ({ ...prev, userLocation: newPos }));
        setUserMarker({ lat: newPos.lat, lng: newPos.lon });
        if (mapRef.current) {
          mapRef.current.panTo({lat: newPos.lat, lng: newPos.lon});
          mapRef.current.setZoom(12);
        }
        setIsLocating(false);
        toast({ title: "Location Found", description: "Clinics sorted by nearest to you." });
      },
      (err) => {
        setIsLocating(false);
        toast({ title: "Location Error", description: err.message, variant: "destructive" });
      },
      options
    );
  };

  const handleServiceFilter = (serviceId: string) => {
    setFilters(prev => ({ ...prev, serviceId: serviceId === 'all' ? null : serviceId }));
  };
  
  const handleClearLocationSort = () => {
    setFilters(prev => ({ ...prev, userLocation: null }));
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

  if (loadError) return <div className="p-4 text-center">Error loading maps.</div>;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-80px)]">
      <div className="w-full md:w-1/3 p-4 overflow-y-auto bg-white shadow-lg flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">Find a Clinic</h1>
        <div className='space-y-2'>
            <Select onValueChange={handleServiceFilter} disabled={isLoadingServices}>
              <SelectTrigger><SelectValue placeholder="Filter by Service..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map(service => <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={handleFindNearMe} disabled={isLocating} className="w-full">
              {isLocating ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <MapPin className="h-4 w-4 mr-2"/>}
              Sort by Nearest Location
            </Button>
            {filters.userLocation && (
              <Button onClick={handleClearLocationSort} variant="ghost" size="sm" className="w-full text-xs">
                <X className="h-3 w-3 mr-1"/> Clear Location Sort
              </Button>
            )}
        </div>
        <div className="flex-grow overflow-y-auto space-y-3 border-t pt-4">
            {isLoadingClinics ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
             : clinics.length > 0 ? clinics.map((clinic) => (
                    <Card key={clinic.id} className="cursor-pointer hover:bg-gray-100" onClick={() => handleListSelect(clinic)}>
                      <CardHeader className="p-4"><CardTitle className="text-lg">{clinic.name}</CardTitle></CardHeader>
                      <CardContent className="p-4 pt-0 text-sm text-gray-600">
                        {clinic.address?.street}, {clinic.address?.city}
                        {clinic.distance && <p className="text-xs text-blue-600 font-semibold mt-1">{(clinic.distance / 1000).toFixed(2)} km away</p>}
                      </CardContent>
                    </Card>
                ))
             : <div className="text-center text-gray-500 py-10"><p>No clinics found for the selected criteria.</p></div>
            }
        </div>
      </div>
      
      <div className="w-full md:w-2/3 h-full">
        {!isLoaded ? <div className='w-full h-full flex justify-center items-center'><Loader2 className='h-10 w-10 animate-spin'/></div>
         : <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={6} onLoad={onMapLoad} onUnmount={onUnmount} options={{ streetViewControl: false, mapTypeControl: false }}>
              {clinics.map((clinic) => (
                  clinic.latitude && clinic.longitude && (
                    <MarkerF key={clinic.id} position={{ lat: clinic.latitude, lng: clinic.longitude }} onClick={() => setSelectedClinic(clinic)} />
                  )
              ))}
              {userMarker && (
                <MarkerF position={userMarker} icon={{ url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234285F4"><circle cx="12" cy="12" r="10" fill="white" stroke="%234285F4" stroke-width="0.5" /><circle cx="12" cy="12" r="6" fill="%234285F4"/></svg>'), scaledSize: new window.google.maps.Size(30, 30),}} zIndex={10} />
              )}
              {selectedClinic && selectedClinic.latitude && selectedClinic.longitude && (
                  <InfoWindowF position={{ lat: selectedClinic.latitude, lng: selectedClinic.longitude }} onCloseClick={() => setSelectedClinic(null)} zIndex={1}>
                      <div className="p-1 max-w-xs">
                          <h4 className="font-bold text-md mb-1">{selectedClinic.name}</h4>
                          <p className="text-sm mb-2">{selectedClinic.address?.street}</p>
                          <Button onClick={handleGetDirections} size="sm"><Navigation className="h-4 w-4 mr-2"/> Get Directions</Button>
                      </div>
                  </InfoWindowF>
              )}
          </GoogleMap>
        }
      </div>
    </div>
  );
}

export default function ClinicFinderPage() {
    return <ClinicFinderClient />;
} 