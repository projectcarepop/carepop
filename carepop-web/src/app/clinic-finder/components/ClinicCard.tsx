'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clinic } from "@/lib/types/clinic";
import { MapPin, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ClinicCardProps {
  clinic: Clinic;
  userLocation: { lat: number; lon: number } | null;
  onViewDetails: (clinic: Clinic) => void;
  onShowRoute: (clinic: Clinic) => void;
  onHighlightChange: (id: string | null) => void;
  isHighlighted: boolean;
}

// Function to calculate distance (haversine formula)
const getDistance = (
  loc1: { lat: number; lon: number },
  loc2: { lat: number; lon: number }
): string => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
  const dLon = (loc2.lon - loc1.lon) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * (Math.PI / 180)) *
      Math.cos(loc2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance.toFixed(1);
};


export default function ClinicCard({ 
  clinic, 
  userLocation, 
  onViewDetails,
  onShowRoute,
  onHighlightChange,
  isHighlighted 
}: ClinicCardProps) {
  
  const distance = userLocation && clinic.latitude && clinic.longitude 
    ? getDistance(userLocation, { lat: clinic.latitude, lon: clinic.longitude }) 
    : null;

  return (
    <Card 
      className={cn(
        "mb-2 transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer",
        isHighlighted 
          ? "bg-accent/80 border-primary/50" 
          : "hover:bg-accent/50"
      )}
      onMouseEnter={() => onHighlightChange(clinic.id)}
      onMouseLeave={() => onHighlightChange(null)}
    >
      <div className="p-4" onClick={() => onViewDetails(clinic)}>
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-base mb-1 pr-2">{clinic.name}</h3>
          {distance && (
            <Badge variant="secondary" className="flex-shrink-0">
              {distance} km
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground flex items-start">
          <MapPin size={14} className="mr-2 mt-0.5 flex-shrink-0" />
          <span className="flex-grow">{clinic.full_address}</span>
        </p>
      </div>
      <div className="px-4 pb-3">
         <Button 
            onClick={(e) => { e.stopPropagation(); onShowRoute(clinic); }} 
            disabled={!userLocation} 
            className="w-full"
            variant="outline"
          >
            <Navigation size={16} className="mr-2" />
            Show Route on Map
          </Button>
      </div>
    </Card>
  );
} 