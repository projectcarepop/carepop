import { relations } from "drizzle-orm/relations";
import { serviceCategories, services, profiles, clinics, appointments, doctors, medicalRecords, reviews, productCategories, products, inventory, patientOrders, healthLogs, menstrualLogs, doctorClinics, doctorServices, patientOrderItems } from "./schema";

export const servicesRelations = relations(services, ({one, many}) => ({
	serviceCategory: one(serviceCategories, {
		fields: [services.categoryId],
		references: [serviceCategories.id]
	}),
	appointments: many(appointments),
	doctorServices: many(doctorServices),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({many}) => ({
	services: many(services),
}));

export const profilesRelations = relations(profiles, ({many}) => ({
	appointments: many(appointments),
	reviews: many(reviews),
	patientOrders: many(patientOrders),
	healthLogs: many(healthLogs),
	menstrualLogs: many(menstrualLogs),
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
	profile: one(profiles, {
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
	doctorClinics: many(doctorClinics),
}));

export const doctorsRelations = relations(doctors, ({many}) => ({
	appointments: many(appointments),
	reviews: many(reviews),
	doctorClinics: many(doctorClinics),
	doctorServices: many(doctorServices),
}));

export const medicalRecordsRelations = relations(medicalRecords, ({one}) => ({
	appointment: one(appointments, {
		fields: [medicalRecords.appointmentId],
		references: [appointments.id]
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
	profile: one(profiles, {
		fields: [reviews.patientId],
		references: [profiles.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	productCategory: one(productCategories, {
		fields: [products.categoryId],
		references: [productCategories.id]
	}),
	inventories: many(inventory),
	patientOrderItems: many(patientOrderItems),
}));

export const productCategoriesRelations = relations(productCategories, ({many}) => ({
	products: many(products),
}));

export const inventoryRelations = relations(inventory, ({one}) => ({
	product: one(products, {
		fields: [inventory.productId],
		references: [products.id]
	}),
}));export const patientOrdersRelations = relations(patientOrders, ({one, many}) => ({
	profile: one(profiles, {
		fields: [patientOrders.patientId],
		references: [profiles.id]
	}),
	patientOrderItems: many(patientOrderItems),
}));

export const healthLogsRelations = relations(healthLogs, ({one}) => ({
	profile: one(profiles, {
		fields: [healthLogs.patientId],
		references: [profiles.id]
	}),
}));

export const menstrualLogsRelations = relations(menstrualLogs, ({one}) => ({
	profile: one(profiles, {
		fields: [menstrualLogs.patientId],
		references: [profiles.id]
	}),
}));

export const doctorClinicsRelations = relations(doctorClinics, ({one}) => ({
	clinic: one(clinics, {
		fields: [doctorClinics.clinicId],
		references: [clinics.id]
	}),
	doctor: one(doctors, {
		fields: [doctorClinics.doctorId],
		references: [doctors.id]
	}),
}));

export const doctorServicesRelations = relations(doctorServices, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorServices.doctorId],
		references: [doctors.id]
	}),
	service: one(services, {
		fields: [doctorServices.serviceId],
		references: [services.id]
	}),
}));

export const patientOrderItemsRelations = relations(patientOrderItems, ({one}) => ({
	patientOrder: one(patientOrders, {
		fields: [patientOrderItems.orderId],
		references: [patientOrders.id]
	}),
	product: one(products, {
		fields: [patientOrderItems.productId],
		references: [products.id]
	}),
}));

