'use client';

// import { mockClinics, MockClinic } from "@/lib/mockData/clinicMockData"; // Remove mock data import
import { Clinic } from "@/lib/types/clinic"; // Import the new Clinic type
import ClinicCard from "./ClinicCard";
import { AlertTriangle } from "lucide-react";

interface ClinicListProps {
  clinics: Clinic[];
  userLocation: { lat: number; lon: number } | null;
  onViewDetails: (clinic: Clinic) => void;
}

export default function ClinicList({ clinics, userLocation, onViewDetails }: ClinicListProps) {
  if (clinics.length === 0) {
    return <p className="text-center text-gray-500">No clinics found matching your criteria.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
      {clinics.map(clinic => (
        <ClinicCard 
          key={clinic.id} 
          clinic={clinic}
          userLocation={userLocation}
          onViewDetails={onViewDetails} 
        />
      ))}
    </div>
  );
} 