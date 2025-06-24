'use client';

// import { mockClinics, MockClinic } from "@/lib/mockData/clinicMockData"; // Remove mock data import
import { Clinic } from "@/lib/types/clinic"; // Import the new Clinic type
import ClinicListItem from './ClinicListItem';

// Define a minimal Clinic type for this component's needs.
// This should match the props expected by the wrapped ClinicListItem component.
type Clinic = {
  id: string;
  name: string;
  full_address: string | null;
  distance_km?: number | null;
};

interface ClinicListProps {
  clinics: Clinic[];
  onViewDetails: (clinic: Clinic) => void;
  onShowRoute: (clinic: Clinic) => void;
  highlightedClinic: string | null;
  onHighlightChange: (clinicId: string | null) => void;
}

export default function ClinicList({ clinics, onViewDetails, onShowRoute, highlightedClinic, onHighlightChange }: ClinicListProps) {
  if (clinics.length === 0) {
    return <p className="text-center text-gray-500">No clinics found matching your criteria.</p>;
  }

  return (
    <div className="flex flex-col space-y-4">
      {clinics.map(clinic => (
        <div 
          key={clinic.id}
          onMouseEnter={() => onHighlightChange(clinic.id)}
          onMouseLeave={() => onHighlightChange(null)}
        >
          <ClinicListItem
            clinic={clinic}
            onViewDetails={onViewDetails}
            onShowRoute={onShowRoute}
            isHighlighted={highlightedClinic === clinic.id}
          />
        </div>
      ))}
    </div>
  );
} 