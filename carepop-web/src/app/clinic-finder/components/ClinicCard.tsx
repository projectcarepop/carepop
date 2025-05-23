'use client';

import { Clinic } from "@/lib/types/clinic";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClinicCardProps {
  clinic: Clinic;
  onViewDetails: (clinic: Clinic) => void;
}

export default function ClinicCard({ clinic, onViewDetails }: ClinicCardProps) {
  const getDisplayAddress = () => {
    if (clinic.full_address) return clinic.full_address;
    const addressParts = [];
    if (clinic.street_address) addressParts.push(clinic.street_address);
    if (clinic.locality) addressParts.push(clinic.locality);
    if (clinic.region) addressParts.push(clinic.region);
    if (clinic.postal_code) addressParts.push(clinic.postal_code);
    return addressParts.join(', ');
  };

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-pink-600 dark:text-pink-400">{clinic.name}</CardTitle>
        {clinic.fpop_chapter_affiliation && (
          <Badge variant="secondary" className="mt-1 text-xs">
            FPOP Chapter: {clinic.fpop_chapter_affiliation}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm">
        <div className="flex items-start">
          <MapPin size={16} className="mr-2 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">{getDisplayAddress()}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 dark:hover:bg-pink-600"
          onClick={() => onViewDetails(clinic)}
        >
          <Info size={16} className="mr-2" /> View Details
        </Button>
      </CardFooter>
    </Card>
  );
} 