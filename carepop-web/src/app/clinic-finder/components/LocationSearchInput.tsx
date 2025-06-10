'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LocationSearchInputProps {
  onLocationFound: (coords: { lat: number; lon: number }) => void;
  onLocationError: (message: string) => void;
}

export default function LocationSearchInput({ onLocationFound, onLocationError }: LocationSearchInputProps) {
  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    onLocationError(''); // Clear previous errors

    if (!navigator.geolocation) {
      onLocationError("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationFound({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        onLocationError(`Error getting location: ${error.message}`);
        setIsLocating(false);
      }
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="location-search">
          Location
        </Label>
        <div className="relative flex items-center mt-1">
          <Input
            type="text"
            id="location-search"
            placeholder="Search by address, city, or area..."
            className="pl-10"
            disabled // Disabled for now as we focus on geolocation
          />
          <div className="absolute left-3 inset-y-0 flex items-center text-gray-400">
            <Search size={18} />
          </div>
        </div>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full" 
        onClick={handleUseCurrentLocation}
        disabled={isLocating}
      >
        {isLocating ? (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            Finding Location...
          </>
        ) : (
          <>
            <LocateFixed size={18} className="mr-2" />
            Use Current Location
          </>
        )}
      </Button>
    </div>
  );
} 