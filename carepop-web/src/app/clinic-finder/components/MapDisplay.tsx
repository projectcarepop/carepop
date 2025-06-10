'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  APIProvider,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';
import { DirectionsService, DirectionsRenderer, GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Clinic } from '@/lib/types/clinic';
import { Loader2 } from 'lucide-react';

const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 }; // Metro Manila
const DEFAULT_ZOOM = 11;
const LOCATION_ZOOM = 14;

interface MapDisplayProps {
  clinics: Clinic[];
  userLocation: { lat: number; lon: number } | null;
  routeDestination: Clinic | null;
  onHighlightChange: (clinicId: string | null) => void;
  highlightedClinic: string | null;
}

const DirectionsComponent = ({ origin, destination }: { origin: { lat: number; lon: number }, destination: Clinic }) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  
  const directionsServiceOptions = useMemo(() => {
    if (!destination.latitude || !destination.longitude) return null;
    return {
      destination: { lat: destination.latitude, lng: destination.longitude },
      origin: { lat: origin.lat, lng: origin.lon },
      travelMode: 'DRIVING' as google.maps.TravelMode,
    };
  }, [origin, destination]);

  const directionsCallback = (
    result: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === 'OK' && result) {
      setDirections(result);
    } else {
      console.error(`Directions request failed due to ${status}`);
      toast.error('Could not fetch directions.', {
        description: `Google API Error: ${status}. Please check API key, billing, and enabled APIs.`,
        duration: 10000,
      });
    }
  };

  if (!directionsServiceOptions) return null;

  return (
    <>
      <DirectionsService options={directionsServiceOptions} callback={directionsCallback} />
      {directions && <DirectionsRenderer options={{ directions, suppressMarkers: true, polylineOptions: { strokeColor: "#FF0000", strokeWeight: 5, strokeOpacity: 0.8 } }} />}
    </>
  );
};

export default function MapDisplay({ clinics, userLocation, routeDestination, onHighlightChange, highlightedClinic }: MapDisplayProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || "",
    libraries: ["geometry", "places"],
  });
  
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    if (userLocation) {
      setCenter({ lat: userLocation.lat, lng: userLocation.lon });
      setZoom(LOCATION_ZOOM);
    }
  }, [userLocation]);

  if (loadError) {
    console.error("Google Maps API script failed to load:", loadError);
    return <div className="h-full w-full flex items-center justify-center bg-red-100 text-red-700 p-4 rounded-lg">Error loading Google Maps. Please check your API key and network connection.</div>;
  }
  
  if (!isLoaded || !apiKey) {
    return <div className="h-full w-full flex items-center justify-center bg-gray-100"><Loader2 className="animate-spin" size={48} /></div>;
  }

  const activeClinics = clinics.filter(clinic => clinic.is_active && clinic.latitude && clinic.longitude);
  
  return (
    <div style={{ height: '100%', width: '100%' }} className="rounded-lg overflow-hidden shadow-md">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        options={{
            gestureHandling: 'greedy',
            disableDefaultUI: true,
            mapId: "carepopClinicFinderMap"
        }}
      >
        {/* We wrap the vis.gl components with APIProvider as they need it, but the main map is now from @react-google-maps/api */}
        <APIProvider apiKey={apiKey}>
            {activeClinics.map((clinic) => {
                const isHighlighted = clinic.id === highlightedClinic;
                return (
                <AdvancedMarker
                    key={clinic.id}
                    position={{ lat: clinic.latitude!, lng: clinic.longitude! }}
                    title={clinic.name}
                    onClick={() => onHighlightChange(clinic.id)}
                >
                    <Pin
                    background={isHighlighted ? '#F472B6' : '#FBCFE8'}
                    borderColor={isHighlighted ? '#EC4899' : '#F9A8D4'}
                    glyphColor={isHighlighted ? '#FFFFFF' : '#9D174D'}
                    scale={isHighlighted ? 1.5 : 1}
                    />
                </AdvancedMarker>
                );
            })}
            
            {userLocation && (
                <AdvancedMarker position={{ lat: userLocation.lat, lng: userLocation.lon }} title={"Your Location"}>
                <Pin background={'#1E90FF'} borderColor={'#1872CC'} glyphColor={'#FFFFFF'} />
                </AdvancedMarker>
            )}

            {userLocation && routeDestination && (
                <DirectionsComponent origin={userLocation} destination={routeDestination} />
            )}
        </APIProvider>
      </GoogleMap>
    </div>
  );
} 