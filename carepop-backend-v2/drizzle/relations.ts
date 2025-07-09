import { relations } from "drizzle-orm/relations";
import { 
	serviceCategories, services, profiles, clinics, 
	appointments, doctors, medicalRecords, reviews, productCategories, 
	products, inventory,
	recordDoctorNotes, recordPrescriptions, recordDocuments, usersInAuth
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
}));

export const doctorsRelations = relations(doctors, ({many}) => ({
	appointments: many(appointments),
	reviews: many(reviews),
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

export const productsRelations = relations(products, ({one, many}) => ({
	productCategory: one(productCategories, {
		fields: [products.categoryId],
		references: [productCategories.id]
	}),
	inventory: one(inventory),
}));

export const productCategoriesRelations = relations(productCategories, ({many}) => ({
	products: many(products),
}));

export const inventoryRelations = relations(inventory, ({one}) => ({
	product: one(products, {
		fields: [inventory.productId],
		references: [products.id]
	}),
}));