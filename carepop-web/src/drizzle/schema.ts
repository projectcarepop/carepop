import { pgTable, index, uuid, text, jsonb, boolean, timestamp, foreignKey, check, numeric, integer, date, unique, primaryKey, pgEnum, customType } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// Placeholder for auth.users table
export const usersInAuth = pgTable("users", {
  id: uuid().primaryKey(),
});

export const appointmentStatus = pgEnum("appointment_status", ['scheduled', 'completed', 'canceled_by_patient', 'canceled_by_admin', 'no_show'])
export const medicalRecordType = pgEnum("medical_record_type", ['PRESCRIPTION', 'LAB_ORDER', 'DOCTOR_NOTE'])
export const orderStatus = pgEnum("order_status", ['pending_payment', 'processing', 'shipped', 'delivered', 'canceled'])
export const userRole = pgEnum("user_role", ['patient', 'admin'])

const geographyPoint = customType<{ data: string }>({
    dataType() {
        return 'geography(Point, 4326)';
    },
});

export const clinics = pgTable("clinics", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text().notNull(),
	address: jsonb(),
	phoneNumber: text("phone_number"),
	logoUrl: text("logo_url"),
	// TODO: failed to parse database type 'geography'
	location: geographyPoint("location"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
	clinicsLocationIdx: index("clinics_location_idx").using("gist", table.location),
}));

export const doctors = pgTable("doctors", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	fullName: text("full_name").notNull(),
	specialtyText: text("specialty_text"),
	bio: text(),
	avatarUrl: text("avatar_url"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const serviceCategories = pgTable("service_categories", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
});

export const services = pgTable("services", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	categoryId: uuid("category_id"),
	name: text().notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	durationMinutes: integer("duration_minutes").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => ({
	servicesCategoryIdFk: foreignKey({
			columns: [table.categoryId],
			foreignColumns: [serviceCategories.id],
			name: "fk_services_category_id"
		}).onDelete("set null"),
	servicesDurationMinutesCheck: check("services_duration_minutes_check", sql`duration_minutes > 0`),
	servicesPriceCheck: check("services_price_check", sql`price >= (0)::numeric`),
}));

export const profiles = pgTable("profiles", {
	id: uuid().primaryKey().notNull(),
	firstName: text("first_name"),
	middleInitial: text("middle_initial"),
	lastName: text("last_name"),
	email: text("email").notNull().unique(),
	contactNo: text("contact_no"),
	genderIdentity: text("gender_identity"),
	pronouns: text("pronouns"),
	assignedSexAtBirth: text("assigned_sex_at_birth"),
	birthday: date("birthday"),
	civilStatus: text("civil_status"),
	religion: text("religion"),
	occupation: text("occupation"),
	philhealthNo: text("philhealth_no"),
	street: text("street"),
	barangayCode: text("baranggay_code"),
	cityMunicipalityCode: text("city_municipality_code"),
	provinceCode: text("province_code"),
	avatarUrl: text("avatar_url"),
	role: userRole("user_role").default('patient').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
	profilesIdFk: foreignKey({
			columns: [table.id],
			foreignColumns: [usersInAuth.id],
			name: "fk_profiles_id"
		}).onDelete("cascade"),
}));

export const appointments = pgTable("appointments", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	patientId: uuid("patient_id").notNull(),
	doctorId: uuid("doctor_id").notNull(),
	serviceId: uuid("service_id").notNull(),
	clinicId: uuid("clinic_id").notNull(),
	appointmentTime: timestamp("appointment_time", { withTimezone: true, mode: 'string' }).notNull(),
	status: appointmentStatus().default('scheduled').notNull(),
	reasonForVisit: text("reason_for_visit"),
	visitSummary: text("visit_summary"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
	idxAppointmentsClinicId: index("idx_appointments_clinic_id").on(table.clinicId),
	idxAppointmentsDoctorId: index("idx_appointments_doctor_id").on(table.doctorId),
	idxAppointmentsPatientId: index("idx_appointments_patient_id").on(table.patientId),
	appointmentsClinicIdFk: foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "fk_appointments_clinic_id"
		}).onDelete("restrict"),
	appointmentsDoctorIdFk: foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "fk_appointments_doctor_id"
		}).onDelete("restrict"),
	appointmentsPatientIdFk: foreignKey({
			columns: [table.patientId],
			foreignColumns: [profiles.id],
			name: "fk_appointments_patient_id"
		}).onDelete("cascade"),
	appointmentsServiceIdFk: foreignKey({
			columns: [table.serviceId],
			foreignColumns: [services.id],
			name: "fk_appointments_service_id"
		}).onDelete("restrict"),
}));

export const medicalRecords = pgTable("medical_records", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	appointmentId: uuid("appointment_id").notNull(),
	recordType: medicalRecordType("record_type").notNull(),
	details: jsonb().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
	medicalRecordsAppointmentIdFk: foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointments.id],
			name: "fk_medical_records_appointment_id"
		}).onDelete("cascade"),
}));

export const reviews = pgTable("reviews", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	appointmentId: uuid("appointment_id").notNull(),
	patientId: uuid("patient_id").notNull(),
	doctorId: uuid("doctor_id"),
	rating: integer().notNull(),
	comment: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
	reviewsAppointmentIdFk: foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointments.id],
			name: "fk_reviews_appointment_id"
		}).onDelete("cascade"),
	reviewsDoctorIdFk: foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "fk_reviews_doctor_id"
		}).onDelete("set null"),
	reviewsPatientIdFk: foreignKey({
			columns: [table.patientId],
			foreignColumns: [profiles.id],
			name: "fk_reviews_patient_id"
		}).onDelete("cascade"),
	reviewsAppointmentIdKey: unique("reviews_appointment_id_key").on(table.appointmentId),
	reviewsRatingCheck: check("reviews_rating_check", sql`(rating >= 1) AND (rating <= 5)`),
}));

export const productCategories = pgTable("product_categories", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
});

export const products = pgTable("products", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	categoryId: uuid("category_id"),
	name: text().notNull(),
	description: text(),
	sku: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	requiresPrescription: boolean("requires_prescription").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => ({
	productsCategoryIdFk: foreignKey({
			columns: [table.categoryId],
			foreignColumns: [productCategories.id],
			name: "fk_products_category_id"
		}).onDelete("set null"),
	productsSkuKey: unique("products_sku_key").on(table.sku),
	productsPriceCheck: check("products_price_check", sql`price >= (0)::numeric`),
}));

export const inventory = pgTable("inventory", {
	productId: uuid("product_id").primaryKey().notNull(),
	quantityOnHand: integer("quantity_on_hand").default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
	inventoryProductIdFk: foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "fk_inventory_product_id"
		}).onDelete("cascade"),
	inventoryQuantityOnHandCheck: check("inventory_quantity_on_hand_check", sql`quantity_on_hand >= 0`),
}));

export const patientOrders = pgTable("patient_orders", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	patientId: uuid("patient_id").notNull(),
	status: orderStatus().default('pending_payment').notNull(),
	shippingAddress: jsonb().notNull(),
	trackingNumber: text("tracking_number"),
	totalAmount: numeric({ precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
	patientOrdersPatientIdFk: foreignKey({
			columns: [table.patientId],
			foreignColumns: [profiles.id],
			name: "fk_patient_orders_patient_id"
		}).onDelete("cascade"),
	patientOrdersTotalAmountCheck: check("patient_orders_total_amount_check", sql`total_amount >= (0)::numeric`),
}));

export const healthLogs = pgTable("health_logs", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	patientId: uuid("patient_id").notNull(),
	logDate: date("log_date").notNull(),
	mood: text(),
	symptoms: text("symptoms").array(),
	notes: text(),
}, (table) => ({
	healthLogsPatientIdLogDateKey: unique("health_logs_patient_id_log_date_key").on(table.patientId, table.logDate),
	healthLogsPatientIdFk: foreignKey({
			columns: [table.patientId],
			foreignColumns: [profiles.id],
			name: "fk_health_logs_patient_id"
		}).onDelete("cascade"),
}));

export const menstrualLogs = pgTable("menstrual_logs", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	patientId: uuid("patient_id").notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date"),
}, (table) => ({
	menstrualLogsPatientIdFk: foreignKey({
			columns: [table.patientId],
			foreignColumns: [profiles.id],
			name: "fk_menstrual_logs_patient_id"
		}).onDelete("cascade"),
}));

export const doctorClinics = pgTable("doctor_clinics", {
	doctorId: uuid("doctor_id").notNull(),
	clinicId: uuid("clinic_id").notNull(),
}, (table) => ({
	pk: primaryKey({ columns: [table.doctorId, table.clinicId] }),
	doctorClinicsClinicIdFk: foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "fk_doctor_clinics_clinic_id"
		}).onDelete("cascade"),
	doctorClinicsDoctorIdFk: foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "fk_doctor_clinics_doctor_id"
		}).onDelete("cascade"),
}));

export const doctorServices = pgTable("doctor_services", {
	doctorId: uuid("doctor_id").notNull(),
	serviceId: uuid("service_id").notNull(),
}, (table) => ({
	pk: primaryKey({ columns: [table.doctorId, table.serviceId] }),
	doctorServicesDoctorIdFk: foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "fk_doctor_services_doctor_id"
		}).onDelete("cascade"),
	doctorServicesServiceIdFk: foreignKey({
			columns: [table.serviceId],
			foreignColumns: [services.id],
			name: "fk_doctor_services_service_id"
		}).onDelete("cascade"),
}));

export const patientOrderItems = pgTable("patient_order_items", {
	orderId: uuid("order_id").notNull(),
	productId: uuid("product_id").notNull(),
	quantity: integer().notNull(),
	pricePerItem: numeric({ precision: 10, scale:  2 }).notNull(),
}, (table) => ({
	patientOrderItemsOrderIdFk: foreignKey({
			columns: [table.orderId],
			foreignColumns: [patientOrders.id],
			name: "fk_patient_order_items_order_id"
		}).onDelete("cascade"),
	patientOrderItemsProductIdFk: foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "fk_patient_order_items_product_id"
		}).onDelete("restrict"),
	patientOrderItemsPricePerItemCheck: check("patient_order_items_price_per_item_check", sql`price_per_item >= (0)::numeric`),
	patientOrderItemsQuantityCheck: check("patient_order_items_quantity_check", sql`quantity > 0`),
}));
