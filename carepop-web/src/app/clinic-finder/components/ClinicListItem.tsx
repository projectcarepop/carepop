'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clinic } from "@/lib/types/clinic";
import { MapPin, Award, Route } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClinicListItemProps {
  clinic: Clinic;
  onViewDetails: (clinic: Clinic) => void;
  onShowRoute: (clinic: Clinic) => void;
  isHighlighted: boolean;
}

export default function ClinicListItem({ clinic, onViewDetails, onShowRoute, isHighlighted }: ClinicListItemProps) {
  return (
    <Card className={cn(
      "p-4 transition-all duration-200 ease-in-out",
      isHighlighted ? "border-pink-500 shadow-lg" : "border-transparent"
    )}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-grow">
          <h3 className="font-bold text-md mb-1">{clinic.name}</h3>
          
          <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
            {clinic.full_address && (
              <p className="flex items-center text-xs">
                <MapPin size={12} className="mr-2 flex-shrink-0" />
                <span>{clinic.full_address}</span>
              </p>
            )}
            {clinic.distance_km && (
                <p className="flex items-center text-xs font-medium text-pink-600">
                    <Award size={12} className="mr-2 flex-shrink-0" />
                    <span>{clinic.distance_km.toFixed(1)} km away</span>
                </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button onClick={() => onViewDetails(clinic)} size="sm" variant="outline" className="flex-1">
            Details
        </Button>
        <Button onClick={() => onShowRoute(clinic)} size="sm" className="flex-1">
            <Route size={14} className="mr-2" />
            Show Route
        </Button>
      </div>
    </Card>
  );
} 