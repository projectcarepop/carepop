'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { getNearbyClinics } from '@/services/api';

// Child Component Imports
import ClinicList from './ClinicList';
import SlidingPanel, { PanelState } from './SlidingPanel';
import ClinicDetailModal from './ClinicDetailModal';
import DynamicMapLoader from './DynamicMapLoader';
import ServiceFilter from './ServiceFilter';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// --- CANONICAL TYPE DEFINITIONS ---
// This is the single, consistent shape we will use for all clinic-related
// state within this component and its children. It satisfies all child prop requirements.
type ClinicForFinder = {
  id: string;
  name: string;
  full_address: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  contact_phone?: string | null;
  contact_email?: string | null;
  website_url?: string | null;
  services_offered?: string[];
  fpop_chapter_affiliation?: string | null;
  distance_km?: number | null;
};

// This matches the data shape from the /public/clinics/nearby API endpoint
type NearbyClinicFromAPI = {
    id: string;
    name: string;
    address: { street: string; city: string; zip: string; } | null;
    location: string; // The backend returns "POINT(lon lat)"
};

// This is the shape for the Service type
type Service = {
    id: string;
    name: string;
};

// Props for the main client component, passed from the parent Server Component
interface ClinicFinderClientProps {
  initialClinics: any[]; // Data comes from a direct Supabase query
  initialServices: Service[];
}

// --- TRANSFORMER FUNCTION ---
// Transforms clinic data from ANY source into our canonical ClinicForFinder shape.
const transformToClinicForFinder = (clinicData: any): ClinicForFinder => {
    let latitude: number | null = null;
    let longitude: number | null = null;
    let full_address: string | null = null;

    // Handle location from the 'nearby' API (string format)
    if (clinicData.location && typeof clinicData.location === 'string') {
        const match = clinicData.location.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
        if (match) {
            longitude = parseFloat(match[1]);
            latitude = parseFloat(match[2]);
        }
    // Handle location from the initial Supabase query (object format)
    } else if (clinicData.location && typeof clinicData.location.lat === 'number' && typeof clinicData.location.lng === 'number') {
        latitude = clinicData.location.lat;
        longitude = clinicData.location.lng;
    }

    // Handle address from either object or string format
    if (clinicData.address && typeof clinicData.address === 'object') {
        full_address = `${clinicData.address.street || ''}, ${clinicData.address.city || ''} ${clinicData.address.zip || ''}`.replace(/^, |, $/g, '').trim();
    } else if (clinicData.full_address) {
        full_address = clinicData.full_address;
    }

    return {
        id: clinicData.id,
        name: clinicData.name,
        full_address: full_address || 'Address not available',
        latitude,
        longitude,
        is_active: clinicData.is_active ?? true,
        contact_phone: clinicData.contact_phone,
        contact_email: clinicData.contact_email,
        website_url: clinicData.website_url,
        services_offered: clinicData.services_offered,
        fpop_chapter_affiliation: clinicData.fpop_chapter_affiliation,
    };
};

// --- COMPONENT IMPLEMENTATION ---
export default function ClinicFinderClient({ initialClinics, initialServices }: ClinicFinderClientProps) {
  const { toast } = useToast();
  const [panelState, setPanelState] = useState<PanelState>('partial');
  const [isLoading, setIsLoading] = useState(false);

  const [clinics, setClinics] = useState<ClinicForFinder[]>(() =>
    initialClinics.map(transformToClinicForFinder)
  );

  const [selectedClinic, setSelectedClinic] = useState<ClinicForFinder | null>(null);
  const [highlightedClinic, setHighlightedClinic] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [routeDestination, setRouteDestination] = useState<ClinicForFinder | null>(null);

  const handleSearch = async (lat: number, lon: number) => {
      setIsLoading(true);
      try {
          const nearbyClinicsFromApi: NearbyClinicFromAPI[] = await getNearbyClinics(lat, lon);
          setClinics(nearbyClinicsFromApi.map(transformToClinicForFinder));
      } catch (error) {
          console.error(error);
          toast({ title: "Error", description: "Could not find nearby clinics." });
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          toast({ title: "Location Access Denied", description: "Map will be centered generally." });
        }
      );
    }
  }, [toast]);

  return (
    <div className="relative w-full h-screen">
      <DynamicMapLoader
        clinics={clinics}
        userLocation={userLocation}
        routeDestination={routeDestination}
        highlightedClinic={highlightedClinic}
        onHighlightChange={(id) => setHighlightedClinic(id)}
        panelState={panelState}
      />

      <SlidingPanel panelState={panelState} setPanelState={setPanelState}>
        <div className="p-4 h-full flex flex-col">
          <ServiceFilter services={initialServices} onFilterChange={() => { /* Implement filtering logic here */ }} />
          <div className="flex items-center justify-between my-4">
             <h2 className="text-xl font-bold">Nearby Clinics</h2>
             <Button onClick={() => userLocation && handleSearch(userLocation.lat, userLocation.lon)} disabled={isLoading || !userLocation}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Search This Area
            </Button>
          </div>

          <div className="flex-grow overflow-y-auto">
            <ClinicList
              clinics={clinics}
              onViewDetails={(c) => setSelectedClinic(c)}
              onShowRoute={(c) => setRouteDestination(c)}
              highlightedClinic={highlightedClinic}
              onHighlightChange={(id) => setHighlightedClinic(id)}
            />
          </div>
        </div>
      </SlidingPanel>

      <ClinicDetailModal
        clinic={selectedClinic}
        isOpen={!!selectedClinic}
        onClose={() => setSelectedClinic(null)}
        allServices={initialServices}
      />
    </div>
  );
}