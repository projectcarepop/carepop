import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import * as schema from "../drizzle/schema";
import { z } from "zod";

// =================================================================
// ENUMS
// =================================================================
export const appointmentStatusEnum = schema.appointmentStatus.enumValues;
export const medicalRecordTypeEnum = schema.medicalRecordType.enumValues;
export const orderStatusEnum = schema.orderStatus.enumValues;
export const userRoleEnum = schema.userRole.enumValues;

// =================================================================
// PROFILES & USERS
// =================================================================
export type Profile = InferSelectModel<typeof schema.profiles>;
export type NewProfile = InferInsertModel<typeof schema.profiles>;

// =================================================================
// CLINICS
// =================================================================
export type Clinic = InferSelectModel<typeof schema.clinics>;
export type NewClinic = InferInsertModel<typeof schema.clinics>;

// =================================================================
// DOCTORS (PROFESSIONALS)
// =================================================================
export type Doctor = InferSelectModel<typeof schema.doctors>;
export type NewDoctor = InferInsertModel<typeof schema.doctors>;

// =================================================================
// SERVICES & CATEGORIES
// =================================================================
export type ServiceCategory = InferSelectModel<typeof schema.serviceCategories>;
export type NewServiceCategory = InferInsertModel<
  typeof schema.serviceCategories
>;

export type Service = InferSelectModel<typeof schema.services>;
export type NewService = InferInsertModel<typeof schema.services>;

// Custom type for services that include the nested category object
export type ServiceWithCategory = Service & {
  serviceCategory: {
    id: string;
    name: string;
  } | null;
};

// =================================================================
// APPOINTMENTS
// =================================================================
export type Appointment = InferSelectModel<typeof schema.appointments>;
export type NewAppointment = InferInsertModel<typeof schema.appointments>;

// To satisfy the simplified booking flow, let's make doctorId optional
// on the type used by the frontend form.
export type AppointmentBookingPayload = Omit<NewAppointment, 'doctorId'> & {
  doctorId?: string | null;
};

// =================================================================
// HEALTH LOGS & RECORDS
// =================================================================
export type MedicalRecord = InferSelectModel<typeof schema.medicalRecords>;
export type NewMedicalRecord = InferInsertModel<typeof schema.medicalRecords>;

export type HealthLog = InferSelectModel<typeof schema.healthLogs>;
export type NewHealthLog = InferInsertModel<typeof schema.healthLogs>;

export type MenstrualLog = InferSelectModel<typeof schema.menstrualLogs>;
export type NewMenstrualLog = InferInsertModel<typeof schema.menstrualLogs>;

// =================================================================
// REVIEWS
// =================================================================
export type Review = InferSelectModel<typeof schema.reviews>;
export type NewReview = InferInsertModel<typeof schema.reviews>;

// =================================================================
// E-COMMERCE (PRODUCTS, INVENTORY, ORDERS)
// =================================================================
export type ProductCategory = InferSelectModel<typeof schema.productCategories>;
export type NewProductCategory = InferInsertModel<
  typeof schema.productCategories
>;

export type Product = InferSelectModel<typeof schema.products>;
export type NewProduct = InferInsertModel<typeof schema.products>;

export type Inventory = InferSelectModel<typeof schema.inventory>;
export type NewInventory = InferInsertModel<typeof schema.inventory>;

export type PatientOrder = InferSelectModel<typeof schema.patientOrders>;
export type NewPatientOrder = InferInsertModel<typeof schema.patientOrders>;

export type PatientOrderItem = InferSelectModel<typeof schema.patientOrderItems>;
export type NewPatientOrderItem = InferInsertModel<
  typeof schema.patientOrderItems
>;

// =================================================================
// RELATIONAL / JOIN TABLES
// =================================================================
export type DoctorClinic = InferSelectModel<typeof schema.doctorClinics>;
export type NewDoctorClinic = InferInsertModel<typeof schema.doctorClinics>;

export type DoctorService = InferSelectModel<typeof schema.doctorServices>;
export type NewDoctorService = InferInsertModel<typeof schema.doctorServices>;

// --- Custom Types with Relations (for specific component needs) ---
export type AppointmentDetails = Appointment & {
  patient: Profile;
  doctor: Doctor;
  clinic: Clinic;
  service: Service;
  medicalRecords: MedicalRecord[];
};

export type ProductWithStockAndCategory = Product & {
  categoryName: string;
  quantityOnHand: number;
};

export type AdminAppointment = Appointment & {
  patientName: string;
  doctorName: string;
  clinicName: string;
  serviceName: string;
};

export type AdminUser = UserProfile & {
  email: string;
  role: string;
  fullName: string;
};

// --- Custom Types for API responses / UI Components ---
export type UserProfile = Profile;

export type DashboardAppointment = {
  id: string;
  appointment_date: string;
  status: "scheduled" | "cancelled" | "completed";
  serviceName: string;
  doctorName: string;
  clinicName: string;
};

export type DashboardMedicalRecord = {
    id: string;
    appointmentId: string;
    title: string;
    summary: string;
    createdAt: string;
    serviceName: string; 
};

export const adminServiceSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.string(),
    durationMinutes: z.number().nullable(),
    isActive: z.boolean(),
    createdAt: z.string(),
    serviceCategory: z.object({
        id: z.string(),
        name: z.string(),
    }).nullable(),
});
export type AdminService = z.infer<typeof adminServiceSchema>;

export const adminDoctorSchema = z.object({
    id: z.string(),
    userId: z.string(),
    fullName: z.string(),
    serviceCategory: z.object({ 
        id: z.string(),
        name: z.string() 
    }).nullable(),
    clinics: z.array(z.object({ id: z.string(), name: z.string() })),
    services: z.array(z.object({ id: z.string(), name: z.string() })),
});
export type AdminDoctor = z.infer<typeof adminDoctorSchema>;

export const adminUserSchema = z.object({
    id: z.string(),
    // ... existing code ...
}); 