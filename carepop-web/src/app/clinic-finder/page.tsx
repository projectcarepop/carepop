'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Navigation } from 'lucide-react';

// Components that are part of the page layout but don't require client interactivity directly here
// import LocationSearchInput from './components/LocationSearchInput'; 
// import ServiceFilter from './components/ServiceFilter';
// import SearchClinicsButton from './components/SearchClinicsButton';
// The above will be rendered by ClinicFinderClient.tsx

// --- API Fetching Function ---
const searchClinics = async (query: string, lat?: number, lon?: number) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (lat !== undefined && lon !== undefined) {
        params.set('lat', String(lat));
        params.set('lon', String(lon));
    }

    // This assumes the backend is running on the same host or is proxied.
    // In a real app, use an environment variable for the API base URL.
    const response = await fetch(`/api/public/search/clinics?${params.toString()}`);
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch clinics');
    }
    const result = await response.json();
    return result.data; // Assuming backend wraps in { data: [...] }
};

// --- Main Client Component ---
function ClinicFinderClient() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [activeClinic, setActiveClinic] = useState<any>(null);
    
    const mapRef = useRef<google.maps.Map | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: ['places'],
    });

    const { data: clinics, isLoading, error, refetch } = useQuery({
        queryKey: ['clinics', searchQuery, userLocation],
        queryFn: () => searchClinics(searchQuery, userLocation?.lat, userLocation?.lng),
        enabled: true,
    });

    useEffect(() => {
        if (searchQuery || userLocation) {
            refetch();
        }
    }, [searchQuery, userLocation, refetch]);
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setUserLocation(null); // Clear location search when doing a text search
        setSearchQuery(searchTerm);
    };

    const handleFindNearMe = () => {
        setSearchTerm('');
        setSearchQuery('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Could not get your location. Please enable location services in your browser.");
            }
        );
    };
    
    const onMapLoad = (map: google.maps.Map) => {
        mapRef.current = map;
    };
    
    if (loadError) return <div>Error loading maps. Please check your API key and network connection.</div>;
    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div className="flex h-[calc(100vh-80px)]"> {/* Adjust height based on your header */}
            <div className="w-1/3 p-4 overflow-y-auto bg-white shadow-lg">
                <h1 className="text-2xl font-bold mb-4">Find a Clinic</h1>
                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                    <Input 
                        placeholder="Search by name or service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button type="submit" size="icon"><Search className="h-4 w-4"/></Button>
                </form>
                <Button onClick={handleFindNearMe} className="w-full mb-4" variant="outline">
                    <MapPin className="h-4 w-4 mr-2"/> Find Near Me
                </Button>
                <div className="space-y-3">
                    {isLoading && <p>Searching...</p>}
                    {error && <p className="text-red-500">{error.message}</p>}
                    {clinics && clinics.map((clinic: any) => (
                        <div key={clinic.id} className="p-3 border rounded-md cursor-pointer hover:bg-gray-100" onClick={() => setActiveClinic(clinic)}>
                            <h3 className="font-semibold">{clinic.name}</h3>
                            <p className="text-sm text-gray-600">{clinic.address?.street}</p>
                            {clinic.distanceKm !== null && <p className="text-xs text-blue-600 font-medium">Approx. {clinic.distanceKm.toFixed(1)} km away</p>}
                        </div>
                    ))}
                </div>
            </div>
            <div className="w-2/3">
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={userLocation || { lat: 12.8797, lng: 121.7740 }} // Default to Philippines center
                    zoom={userLocation ? 12 : 6}
                    onLoad={onMapLoad}
                >
                    {clinics && clinics.map((clinic: any) => (
                        <Marker 
                            key={clinic.id} 
                            position={{ lat: clinic.location.y, lng: clinic.location.x }} // Assuming PostGIS point {x, y}
                            onClick={() => setActiveClinic(clinic)}
                        />
                    ))}
                    {activeClinic && (
                        <InfoWindow
                            position={{ lat: activeClinic.location.y, lng: activeClinic.location.x }}
                            onCloseClick={() => setActiveClinic(null)}
                        >
                            <div className="p-1 max-w-xs">
                                <h4 className="font-bold text-md mb-1">{activeClinic.name}</h4>
                                <p className="text-sm mb-2">{activeClinic.address?.street}</p>
                                {activeClinic.phoneNumber && <p className="text-sm mb-2">{activeClinic.phoneNumber}</p>}
                                <Button asChild size="sm">
                                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${activeClinic.location.y},${activeClinic.location.x}`} target="_blank" rel="noopener noreferrer">
                                        <Navigation className="h-4 w-4 mr-2"/> Get Directions
                                    </a>
                                </Button>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </div>
        </div>
    );
}

// The page is now just a wrapper for the client component.
export default function ClinicFinderPage() {
    return <ClinicFinderClient />;
} 