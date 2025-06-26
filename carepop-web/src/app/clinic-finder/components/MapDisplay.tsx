'use client';

import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { PanelState } from './SlidingPanel';

type Clinic = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
};

interface MapDisplayProps {
  clinics: Clinic[];
  userLocation: { lat: number; lon: number } | null;
  highlightedClinic: string | null;
  onHighlightChange: (clinicId: string | null) => void;
  panelState: PanelState;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Default center is Metro Manila
const defaultCenter = {
  lat: 14.5995,
  lng: 120.9842
};

export default function MapDisplay({ clinics, userLocation, highlightedClinic, onHighlightChange }: MapDisplayProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [selected, setSelected] = React.useState<Clinic | null>(null);

  const mapCenter = userLocation
    ? { lat: userLocation.lat, lng: userLocation.lon }
    : defaultCenter;

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={12}
    >
      {clinics.map((clinic) => (
        clinic.latitude && clinic.longitude && (
          <Marker
            key={clinic.id}
            position={{ lat: clinic.latitude, lng: clinic.longitude }}
            onClick={() => {
              setSelected(clinic);
              onHighlightChange(clinic.id);
            }}
            opacity={highlightedClinic === clinic.id ? 1 : 0.7}
          />
        )
      ))}

      {selected ? (
        <InfoWindow
          position={{ lat: selected.latitude!, lng: selected.longitude! }}
          onCloseClick={() => {
            setSelected(null);
            onHighlightChange(null);
          }}
        >
          <div>
            <h4>{selected.name}</h4>
          </div>
        </InfoWindow>
      ) : null}
    </GoogleMap>
  );
} 