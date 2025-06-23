// Corresponds to data from: Backend Integration Guide - Section 1.1
export interface Clinic {
  id: string;
  name: string;
  isActive: boolean;
  streetAddress: string | null;
  locality: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string | null;
  latitude: string | null;
  longitude: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  operationDays: string[] | null;
  operationHours: string | null;
  fpopChapterAffiliation: string | null;
  additionalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  // Kept for backward compatibility with display logic, will be derived
  address?: string; 
}

// This is the correct definition for a single specialization/category.
export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
}

// Corresponds to data from: Backend Integration Guide - Section 1.2
export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  durationMinutes: number | null;
  isActive: boolean;
  specializationId: string | null;
  specialization?: ServiceCategory; // The nested object from the API
  // DEPRECATED but kept for now to avoid breaking other components.
  category?: string;
  cost?: number | string;
  typicalDurationMinutes?: number;
  requiresProviderAssignment?: boolean;
}

// This is a view model for displaying services grouped by category name.
export interface GroupedService {
  category: string;
  services: Service[];
}

// Corresponds to data from: Backend Integration Guide - Section 2.1
export interface Provider {
  id: string;
  profileId: string | null;
  licenseNumber: string | null;
  bio: string | null;
  acceptingNewPatients: boolean;
  profile: {
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
  // DEPRECATED but kept for now to avoid breaking other components
  fullName?: string;
  specialty?: string;
  photoUrl?: string;
}

// Corresponds to data from: Backend Integration Guide - Section 3.1
export interface AvailabilitySlot {
  slotId: string; // Or a unique identifier like a timestamp
  startTime: string; // ISO Date string
  endTime: string; // ISO Date string
}

// For the context state
export interface BookingState {
  currentStep: number;
  
  // Step 1 Data
  clinics: Clinic[];
  selectedClinic: Clinic | null;
  servicesForClinic: GroupedService[];
  selectedService: Service | null;
  
  // Step 2 Data (was Step 3)
  availabilitySlots: AvailabilitySlot[];
  selectedDate: Date | null; 
  selectedTimeSlot: AvailabilitySlot | null;
  
  // Step 3 Data (was step 4)
  bookingNotes: string;
  bookingConfirmation: BookingConfirmationData | null;

  // Loading and Error States
  isLoading: {
    clinics: boolean;
    servicesForClinic: boolean;
    availabilitySlots: boolean;
    bookingSubmission: boolean;
  };
  errors: {
    clinics: string | null;
    servicesForClinic: string | null;
    availabilitySlots: string | null;
    bookingSubmission: string | null;
  };
}

// For POST /api/appointments response - Backend Integration Guide - Section 4.1
export interface BookingConfirmationData {
  appointmentId: string;
  status: string;
  clinicName: string;
  serviceName: string;
  providerName: string;
  appointment_datetime: string;
}

export type BookingAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'SET_CLINICS_LOADING'; payload: boolean }
  | { type: 'SET_CLINICS_SUCCESS'; payload: Clinic[] }
  | { type: 'SET_CLINICS_ERROR'; payload: string | null }
  | { type: 'SELECT_CLINIC'; payload: Clinic | null }
  | { type: 'SET_SERVICES_FOR_CLINIC_LOADING'; payload: boolean }
  | { type: 'SET_SERVICES_FOR_CLINIC_SUCCESS'; payload: GroupedService[] }
  | { type: 'SET_SERVICES_FOR_CLINIC_ERROR'; payload: string | null }
  | { type: 'SELECT_SERVICE'; payload: Service | null }
  | { type: 'SET_AVAILABILITY_LOADING'; payload: boolean }
  | { type: 'SET_AVAILABILITY_SUCCESS'; payload: AvailabilitySlot[] }
  | { type: 'SET_AVAILABILITY_ERROR'; payload: string | null }
  | { type: 'SELECT_DATE'; payload: Date | null }
  | { type: 'SELECT_TIME_SLOT'; payload: AvailabilitySlot | null }
  | { type: 'SET_BOOKING_NOTES'; payload: string }
  | { type: 'SET_BOOKING_SUBMISSION_LOADING'; payload: boolean }
  | { type: 'SET_BOOKING_SUBMISSION_SUCCESS'; payload: BookingConfirmationData | null }
  | { type: 'SET_BOOKING_SUBMISSION_ERROR'; payload: string | null }
  | { type: 'RESET_BOOKING_STATE' }; 