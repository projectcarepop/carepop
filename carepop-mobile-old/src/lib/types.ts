// This is a temporary workaround to remove the Drizzle dependency from the mobile client.
// Ideally, these types would be in a shared package.

export type AppointmentStatus = 'scheduled' | 'completed' | 'canceled_by_patient' | 'canceled_by_admin' | 'no_show';
export type MedicalRecordType = 'PRESCRIPTION' | 'LAB_ORDER' | 'DOCTOR_NOTE';
export type OrderStatus = 'pending_payment' | 'processing' | 'shipped' | 'delivered' | 'canceled';
export type UserRole = 'patient' | 'admin';
export type DayOfWeek = "SUNDAY" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";

export type Profile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  middleInitial: string | null;
  email: string;
  role: UserRole;
  birthday: string | null; // Changed from date_of_birth to match form
  contactNo: string | null;
  street: string | null;
  provinceCode: string | null;
  cityMunicipalityCode: string | null;
  barangayCode: string | null;
  civilStatus: string | null;
  religion: string | null;
  occupation: string | null;
  philhealthNo: string | null;
  genderIdentity: string | null;
  pronouns: string | null;
  assignedSexAtBirth: string | null;
  createdAt: string;
  updatedAt: string;
  // ... add other profile fields as needed
};

export type Clinic = {
  id: string;
  name: string;
  address: any | null; // JSONB
  // ... add other clinic fields as needed
};

export type Doctor = {
  id: string;
  fullName: string;
  specialtyText: string | null;
  // ... add other doctor fields as needed
};

export type Service = {
  id: string;
  name: string;
  description: string | null;
  price: string; // Numeric is string in JS
  durationMinutes: number;
};

export type ServiceCategory = {
  id: string;
  name: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  clinicId: string;
  appointmentTime: string; // ISO String
  status: AppointmentStatus;
};

export type MedicalRecord = {
  id: string;
  appointmentId: string;
  recordType: MedicalRecordType;
  details: any; // JSONB
  createdAt: string; // ISO String
};

// This is a subset for creating a new appointment
export type NewAppointment = {
  patientId: string;
  doctorId: string;
  serviceId: string;
  clinicId: string;
  appointmentTime: string; // ISO String
};


// More specific types for API payloads and rich client-side objects
export type UpdateProfilePayload = Partial<Omit<Profile, "id" | "email" | "role" | "createdAt" | "updatedAt">>;

export type DetailedAppointment = Appointment & {
  doctor: Pick<Doctor, 'id' | 'fullName' | 'specialtyText'>;
  clinic: Pick<Clinic, 'id' | 'name' | 'address'>;
  service: Pick<Service, 'id' | 'name' | 'price' | 'durationMinutes'>;
};

export type AvailabilitySlot = {
  doctorId: string;
  doctorName: string;
  avatarUrl?: string | null;
  specialtyText?: string | null;
  slots: string[];
};