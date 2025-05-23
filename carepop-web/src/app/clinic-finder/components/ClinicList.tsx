'use client';

// import { mockClinics, MockClinic } from "@/lib/mockData/clinicMockData"; // Remove mock data import
import { Clinic } from "@/lib/types/clinic"; // Import the new Clinic type
import ClinicCard from "./ClinicCard";
import { AlertTriangle } from "lucide-react";

interface ClinicListProps {
  clinics?: Clinic[]; // Use Clinic type
}

export default function ClinicList({ clinics }: ClinicListProps) {
  // Use passed-in clinics if provided. If not, or if it's empty, handle appropriately.
  const clinicsToDisplay = clinics ? clinics.filter(clinic => clinic.is_active) : [];

  if (clinicsToDisplay.length === 0) {
    return (
      <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center shadow-sm">
        <AlertTriangle size={32} className="mx-auto mb-3 text-yellow-500" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">No clinics found.</p>
        {/* Removed "Try adjusting your search filters." for now, as filters aren't connected to API yet */}
        <p className="text-sm text-gray-500 dark:text-gray-500">
          {clinics ? "No active clinics match your current view." : "Clinic data is currently unavailable."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
      {/* Note: On very large screens within the 9-col span, 2 cards side-by-side might look good. 
          Otherwise, a single column list is also fine, especially on smaller main content areas. 
          Adjust lg:grid-cols-1 / xl:grid-cols-2 as needed based on final page layout. */}
      {clinicsToDisplay.map((clinic) => (
        <ClinicCard key={clinic.id} clinic={clinic} />
      ))}
    </div>
  );
} 