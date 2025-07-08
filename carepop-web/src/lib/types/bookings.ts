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
  address: string; // Assuming address is a simple string for now
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