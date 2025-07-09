export interface UserProfile {
  id: string;
  email: string;
  role?: 'admin' | 'user'; // Make it optional as it might not always be present
  firstName: string | null;
  lastName: string | null;
  // Add other profile fields from your database schema as needed
  // e.g., dateOfBirth: string | null;
}

export interface Appointment {
  id: string;
  appointment_date: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  // These names are joined in the backend API response
  serviceName: string;
  doctorName: string;
  clinicName: string;
}

export interface MedicalRecord {
    id: string;
    record_date: string;
    type: string; // e.g., "Lab Result", "Consultation Note"
    title: string;
    // This name is joined in the backend API response
    doctorName: string;
}

export type Doctor = {
  id: string;
  fullName: string;
  specialtyText: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  durationMinutes: number;
  categoryId: string;
  isActive: boolean;
}; 