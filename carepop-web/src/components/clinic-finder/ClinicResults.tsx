'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type ClinicSearchResult } from '@/app/find-a-clinic/page'; // Import the correct type
import { AlertTriangle, Loader, Map, Navigation } from 'lucide-react';

interface ClinicResultsProps {
  clinics: ClinicSearchResult[];
  isLoading: boolean;
  isError: boolean;
  userLocation: { lat: number; lon: number } | null;
}

const ClinicResults: React.FC<ClinicResultsProps> = ({ clinics, isLoading, isError, userLocation }) => {
  const handleGetDirections = (clinicLocation: { lat: number, lon: number }) => {
    const origin = userLocation ? `${userLocation.lat},${userLocation.lon}` : 'My Location';
    const destination = `${clinicLocation.lat},${clinicLocation.lon}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="text-center py-10 flex flex-col items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg text-gray-600">Finding clinics...</p>
      </div>
    );
  }

  if (isError) {
    return (
        <div className="text-center py-10 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-lg text-red-700">Something went wrong.</p>
            <p className="text-sm text-red-600">Could not fetch clinics. Please try again later.</p>
        </div>
    );
  }

  if (clinics.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700">No Clinics Found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your search or using the &quot;Find Near Me&quot; feature.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clinics.map((clinic) => {
        // Assuming location is a GeoJSON Point as string: "POINT(lon lat)"
        const locationMatch = clinic.location?.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
        const clinicCoords = locationMatch ? { lon: parseFloat(locationMatch[1]), lat: parseFloat(locationMatch[2]) } : null;

        return (
            <Card key={clinic.id} className="flex flex-col">
            <CardHeader>
                <CardTitle className="text-xl">{clinic.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-gray-600 mb-4">{clinic.address?.street}, {clinic.address?.city}</p>
                {clinic.distance != null && (
                <p className="text-sm font-medium text-primary mb-4">
                    {(clinic.distance / 1000).toFixed(1)} km away
                </p>
                )}
            </CardContent>
            <div className="p-6 pt-0">
                <Button 
                    className="w-full"
                    onClick={() => clinicCoords && handleGetDirections(clinicCoords)}
                    disabled={!clinicCoords}
                >
                    <Navigation className="mr-2 h-4 w-4" />
                    Get Directions
                </Button>
            </div>
            </Card>
        );
      })}
    </div>
  );
};

export default ClinicResults; 