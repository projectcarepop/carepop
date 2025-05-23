'use client';

import { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
// import { mockClinics, MockClinic } from "@/lib/mockData/clinicMockData"; // Remove mock data import
import { Clinic } from '@/lib/types/clinic'; // Import the new Clinic type

const DEFAULT_CENTER = { lat: 14.5995, lng: 120.9842 }; // Metro Manila
const DEFAULT_ZOOM = 11;

interface MapDisplayProps {
  clinics: Clinic[]; // Add clinics prop
}

export default function MapDisplay({ clinics }: MapDisplayProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null); // Use Clinic type

  // State to manage if the component is ready to render (client-side only)
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!apiKey) {
    console.error("Google Maps API key is missing. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
    return <div className="h-full w-full flex items-center justify-center bg-red-100 text-red-700 p-4 rounded-lg">Google Maps API key is missing. Map cannot be loaded.</div>;
  }

  // Prevent rendering on the server
  if (!isClient) {
    return <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500 p-4 rounded-lg">Loading map...</div>; 
  }

  const activeClinics = clinics.filter(clinic => clinic.is_active);

  return (
    <APIProvider apiKey={apiKey}>
      <div style={{ height: '100%', width: '100%' }} className="rounded-lg overflow-hidden shadow-md">
        <Map
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId={"carepopClinicFinderMap"} // Optional: for custom styling via Cloud Console
        >
          {activeClinics.map((clinic) => (
            <AdvancedMarker
              key={clinic.id}
              position={{ lat: clinic.latitude, lng: clinic.longitude }}
              onClick={() => setSelectedClinic(clinic)}
            >
              <Pin 
                background={'#FF69B4'} // Hot Pink (CarePoP primary-ish)
                borderColor={'#D1478D'} 
                glyphColor={'#FFFFFF'} 
              />
            </AdvancedMarker>
          ))}

          {selectedClinic && (
            <InfoWindow
              position={{ lat: selectedClinic.latitude, lng: selectedClinic.longitude }}
              pixelOffset={[0, -40]} // Adjust as needed for Pin height
              onCloseClick={() => setSelectedClinic(null)}
            >
              <div className="p-1">
                <h3 className="font-semibold text-sm text-pink-600">{selectedClinic.name}</h3>
                <p className="text-xs text-gray-600">
                  {selectedClinic.full_address || 
                   `${selectedClinic.address_street || ''} ${selectedClinic.address_barangay || ''} ${selectedClinic.address_city}, ${selectedClinic.address_province}`.trim().replace(/\s+/g, ' ')
                  }
                </p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
} 