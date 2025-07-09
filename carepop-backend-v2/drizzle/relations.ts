import { relations } from "drizzle-orm/relations";
import { 
	serviceCategories, services, profiles, clinics, 
	appointments, doctors, medicalRecords, reviews, productCategories, 
	recordDoctorNotes, recordPrescriptions, recordDocuments, usersInAuth,
	clinicServices,
	doctorClinics,
	doctorClinicServices,
	inventory_items
} from "./schema";

export const servicesRelations = relations(services, ({ one, many }) => ({
	serviceCategory: one(serviceCategories, {
		fields: [services.categoryId],
		references: [serviceCategories.id]
	}),
	appointments: many(appointments),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
	services: many(services),
}));

export const profilesRelations = relations(profiles, ({ many, one }) => ({
	appointments: many(appointments),
	reviews: many(reviews),
    user: one(usersInAuth, {
        fields: [profiles.id],
        references: [usersInAuth.id],
    })
}));

export const usersInAuthRelations = relations(usersInAuth, ({ one }) => ({
    profile: one(profiles),
}));

export const appointmentsRelations = relations(appointments, ({one, many}) => ({
	clinic: one(clinics, {
		fields: [appointments.clinicId],
		references: [clinics.id]
	}),
	doctor: one(doctors, {
		fields: [appointments.doctorId],
		references: [doctors.id]
	}),
	patient: one(profiles, {
		fields: [appointments.patientId],
		references: [profiles.id]
	}),
	service: one(services, {
		fields: [appointments.serviceId],
		references: [services.id]
	}),
	medicalRecords: many(medicalRecords),
	review: one(reviews),
}));

export const clinicsRelations = relations(clinics, ({many}) => ({
	appointments: many(appointments),
	clinicServices: many(clinicServices),
    doctorClinics: many(doctorClinics),
}));

export const doctorsRelations = relations(doctors, ({many}) => ({
	appointments: many(appointments),
	reviews: many(reviews),
	doctorClinics: many(doctorClinics),
    doctorClinicServices: many(doctorClinicServices),
}));

export const medicalRecordsRelations = relations(medicalRecords, ({one, many}) => ({
	appointment: one(appointments, {
		fields: [medicalRecords.appointmentId],
		references: [appointments.id]
	}),
    doctorNotes: many(recordDoctorNotes),
    prescriptions: many(recordPrescriptions),
    documents: many(recordDocuments),
}));

export const recordDoctorNotesRelations = relations(recordDoctorNotes, ({one}) => ({
    medicalRecord: one(medicalRecords, {
        fields: [recordDoctorNotes.recordId],
        references: [medicalRecords.id],
    }),
}));

export const recordPrescriptionsRelations = relations(recordPrescriptions, ({one}) => ({
    medicalRecord: one(medicalRecords, {
        fields: [recordPrescriptions.recordId],
        references: [medicalRecords.id],
    }),
}));

export const recordDocumentsRelations = relations(recordDocuments, ({one}) => ({
    medicalRecord: one(medicalRecords, {
        fields: [recordDocuments.recordId],
        references: [medicalRecords.id],
    }),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	appointment: one(appointments, {
		fields: [reviews.appointmentId],
		references: [appointments.id]
	}),
	doctor: one(doctors, {
		fields: [reviews.doctorId],
		references: [doctors.id]
	}),
	patient: one(profiles, {
		fields: [reviews.patientId],
		references: [profiles.id]
	}),
}));

export const productCategoriesRelations = relations(productCategories, ({many}) => ({
	products: many(inventory_items),
}));


// --- JOIN TABLE RELATIONS ---

export const clinicServicesRelations = relations(clinicServices, ({ one }) => ({
	clinic: one(clinics, {
		fields: [clinicServices.clinicId],
		references: [clinics.id],
	}),
	service: one(services, {
		fields: [clinicServices.serviceId],
		references: [services.id],
	}),
}));

export const doctorClinicsRelations = relations(doctorClinics, ({ one }) => ({
	doctor: one(doctors, {
		fields: [doctorClinics.doctorId],
		references: [doctors.id],
	}),
	clinic: one(clinics, {
		fields: [doctorClinics.clinicId],
		references: [clinics.id],
	}),
}));

export const doctorClinicServicesRelations = relations(doctorClinicServices, ({ one }) => ({
	doctor: one(doctors, {
		fields: [doctorClinicServices.doctorId],
		references: [doctors.id],
	}),
	clinic: one(clinics, {
		fields: [doctorClinicServices.clinicId],
		references: [clinics.id],
	}),
	service: one(services, {
		fields: [doctorClinicServices.serviceId],
		references: [services.id],
	}),
}));