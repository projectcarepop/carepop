'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clinic } from "@/lib/types/clinic";
import { Globe, Mail, MapPin, Phone, Navigation } from "lucide-react";

interface ClinicCardProps {
  clinic: Clinic;
  userLocation: { lat: number; lon: number } | null;
  onViewDetails: (clinic: Clinic) => void;
}

export default function ClinicCard({ clinic, userLocation, onViewDetails }: ClinicCardProps) {
  const handleGetDirections = () => {
    if (!userLocation) return;
    const { latitude, longitude } = clinic;
    if (latitude && longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lon}&destination=${latitude},${longitude}`;
      window.open(url, '_blank');
    }
  };
  
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{clinic.name}</CardTitle>
        <CardDescription>{clinic.fpop_chapter_affiliation}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="flex items-start space-x-3">
          <MapPin className="h-4 w-4 mt-1 text-gray-500" />
          <p className="text-sm text-gray-700 dark:text-gray-300">{clinic.full_address}</p>
        </div>
        {clinic.contact_phone && (
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-gray-500" />
            <p className="text-sm text-gray-700 dark:text-gray-300">{clinic.contact_phone}</p>
          </div>
        )}
        {clinic.contact_email && (
           <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <p className="text-sm text-gray-700 dark:text-gray-300">{clinic.contact_email}</p>
          </div>
        )}
         {clinic.website_url && (
           <div className="flex items-center space-x-3">
            <Globe className="h-4 w-4 text-gray-500" />
            <a href={clinic.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
              Visit Website
            </a>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button onClick={() => onViewDetails(clinic)} className="w-full" variant="outline">
          View Details
        </Button>
        <Button onClick={handleGetDirections} disabled={!userLocation} className="w-full">
          <Navigation size={16} className="mr-2" />
          Get Directions
        </Button>
      </CardFooter>
    </Card>
  );
} 