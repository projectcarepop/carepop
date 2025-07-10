export type ClinicOverride = {
    id: string;
    clinicId: string;
    startDateTime: string;
    endDateTime: string;
    reason: string | null;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
};

// A place for all our booking-flow related types to ensure consistency and type safety.

export interface Clinic {
  id: string;
  name: string;
  // Fix: Use individual address fields that match the actual data structure
  street?: string | null;
  cityMunicipality?: { name: string, code: string } | string | null;
  province?: { name: string, code: string } | string | null;
  zipCode?: string | null;
  latitude?: number;
  longitude?: number;
  phone?: string | null;
  website?: string | null;
  distance?: number;
  // Add other clinic details as needed
}

export type Service = {
    id: string;
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    serviceCategory?: {
        id: string;
        name: string;
    };
};

export type ServiceCategory = {
    id: string;
    name: string;
};

export interface Doctor {
  id: string;
  fullName: string;
  avatarUrl?: string;
  specialtyText?: string;
  // Add other doctor details as needed
} 