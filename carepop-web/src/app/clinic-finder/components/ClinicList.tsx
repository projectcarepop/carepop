'use client';

import ClinicListItem from './ClinicListItem';
import type { ClinicForFinder } from './ClinicFinderClient';

interface ClinicListProps {
  clinics: ClinicForFinder[];
  onViewDetails: (clinic: ClinicForFinder) => void;
  onShowRoute: (clinic: ClinicForFinder) => void;
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