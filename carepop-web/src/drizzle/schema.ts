import { pgTable, index, pgPolicy, uuid, text, jsonb, boolean, timestamp, foreignKey, check, numeric, integer, date, unique, primaryKey, pgEnum, customType } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// Placeholder for auth.users table
export const usersInAuth = pgTable("users", {
  id: uuid().primaryKey(),
}, (_table) => {
    return {
        tableName: "users",
        schemaName: "auth"
    }
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
}, (table) => [
	index("clinics_location_idx").using("gist", table.location.asc().nullsLast().op("gist_geography_ops")),
	pgPolicy("Admins can manage platform data.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	pgPolicy("Anyone can view public data.", { as: "permissive", for: "select", to: ["public"] }),
]);

export const doctors = pgTable("doctors", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	fullName: text("full_name").notNull(),
	specialtyText: text("specialty_text"),
	bio: text(),
	avatarUrl: text("avatar_url"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	pgPolicy("Admins can manage platform data.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	pgPolicy("Anyone can view public data.", { as: "permissive", for: "select", to: ["public"] }),
]);

export const serviceCategories = pgTable("service_categories", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
}, (_table) => [
	pgPolicy("Admins can manage platform data.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	pgPolicy("Anyone can view public data.", { as: "permissive", for: "select", to: ["public"] }),
]);

export const services = pgTable("services", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	categoryId: uuid("category_id"),
	name: text().notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	durationMinutes: integer("duration_minutes").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [serviceCategories.id],
			name: "fk_services_category_id"
		}).onDelete("set null"),
	pgPolicy("Admins can manage platform data.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	pgPolicy("Anyone can view public data.", { as: "permissive", for: "select", to: ["public"] }),
	check("services_duration_minutes_check", sql`duration_minutes > 0`),
	check("services_price_check", sql`price >= (0)::numeric`),
]);

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
	role: userRole().default('patient').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.id],
			foreignColumns: [usersInAuth.id],
			name: "fk_profiles_id"
		}).onDelete("cascade"),
	pgPolicy("Admins can manage all profiles.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	pgPolicy("Users can update their own profile.", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Users can view their own profile.", { as: "permissive", for: "select", to: ["public"] }),
]);

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
}, (table) => [
	index("idx_appointments_clinic_id").using("btree", table.clinicId.asc().nullsLast().op("uuid_ops")),
	index("idx_appointments_doctor_id").using("btree", table.doctorId.asc().nullsLast().op("uuid_ops")),
	index("idx_appointments_patient_id").using("btree", table.patientId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "fk_appointments_clinic_id"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "fk_appointments_doctor_id"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [profiles.id],
			name: "fk_appointments_patient_id"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serviceId],
			foreignColumns: [services.id],
			name: "fk_appointments_service_id"
		}).onDelete("restrict"),
	pgPolicy("Admins can manage all patient-owned data.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	pgPolicy("Patients can create their own appointments.", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Patients can update (e.g., cancel) their own appointments.", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("Patients can view their own appointments.", { as: "permissive", for: "select", to: ["public"] }),
]);

export const medicalRecords = pgTable("medical_records", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	appointmentId: uuid("appointment_id").notNull(),
	recordType: medicalRecordType("record_type").notNull(),
	details: jsonb().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointments.id],
			name: "fk_medical_records_appointment_id"
		}).onDelete("cascade"),
	pgPolicy("Admins can manage all patient-owned data.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	pgPolicy("Patients can view their own medical records.", { as: "permissive", for: "select", to: ["public"] }),
]);

export const reviews = pgTable("reviews", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	appointmentId: uuid("appointment_id").notNull(),
	patientId: uuid("patient_id").notNull(),
	doctorId: uuid("doctor_id"),
	rating: integer().notNull(),
	comment: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.appointmentId],
			foreignColumns: [appointments.id],
			name: "fk_reviews_appointment_id"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "fk_reviews_doctor_id"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [profiles.id],
			name: "fk_reviews_patient_id"
		}).onDelete("cascade"),
	unique("reviews_appointment_id_key").on(table.appointmentId),
	pgPolicy("Admins can manage all reviews.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	pgPolicy("Anyone can read reviews.", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("Patients can create reviews for their own appointments.", { as: "permissive", for: "insert", to: ["public"] }),
	check("reviews_rating_check", sql`(rating >= 1) AND (rating <= 5)`),
]);

export const productCategories = pgTable("product_categories", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
}, (table) => [
	pgPolicy("Admins can manage platform data.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	pgPolicy("Anyone can view public data.", { as: "permissive", for: "select", to: ["public"] }),
]);

export const products = pgTable("products", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	categoryId: uuid("category_id"),
	name: text().notNull(),
	description: text(),
	sku: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	requiresPrescription: boolean("requires_prescription").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [productCategories.id],
			name: "fk_products_category_id"
		}).onDelete("set null"),
	unique("products_sku_key").on(table.sku),
	pgPolicy("Admins can manage platform data.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	pgPolicy("Anyone can view public data.", { as: "permissive", for: "select", to: ["public"] }),
	check("products_price_check", sql`price >= (0)::numeric`),
]);

export const inventory = pgTable("inventory", {
	productId: uuid("product_id").primaryKey().notNull(),
	quantityOnHand: integer("quantity_on_hand").default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "fk_inventory_product_id"
		}).onDelete("cascade"),
	pgPolicy("Admins can manage platform data.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	check("inventory_quantity_on_hand_check", sql`quantity_on_hand >= 0`),
]);

export const patientOrders = pgTable("patient_orders", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	patientId: uuid("patient_id").notNull(),
	status: orderStatus().default('pending_payment').notNull(),
	shippingAddress: jsonb("shipping_address"),
	trackingNumber: text("tracking_number"),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [profiles.id],
			name: "fk_patient_orders_patient_id"
		}).onDelete("set null"),
	pgPolicy("Admins can manage all patient-owned data.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	pgPolicy("Patients can manage their own orders.", { as: "permissive", for: "all", to: ["public"] }),
]);

export const healthLogs = pgTable("health_logs", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	patientId: uuid("patient_id").notNull(),
	logDate: date("log_date").notNull(),
	mood: text(),
	symptoms: text().array(),
	notes: text(),
}, (table) => [
	index("idx_health_logs_patient_id_log_date").using("btree", table.patientId.asc().nullsLast().op("date_ops"), table.logDate.desc().nullsFirst().op("date_ops")),
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [profiles.id],
			name: "fk_health_logs_patient_id"
		}).onDelete("cascade"),
	unique("health_logs_patient_id_log_date_key").on(table.patientId, table.logDate),
	pgPolicy("Patients can manage their own health logs.", { as: "permissive", for: "all", to: ["public"], using: sql`(auth.uid() = patient_id)` }),
]);

export const menstrualLogs = pgTable("menstrual_logs", {
	id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	patientId: uuid("patient_id").notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date"),
	flowIntensity: text("flow_intensity"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (_table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [profiles.id],
			name: "fk_menstrual_logs_patient_id"
		}).onDelete("cascade"),
	pgPolicy("Admins can manage all patient-owned data.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	pgPolicy("Patients can create their own menstrual logs.", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("Patients can view and delete their own menstrual logs.", { as: "permissive", for: "all", to: ["public"] }),
]);

export const doctorClinics = pgTable("doctor_clinics", {
	doctorId: uuid("doctor_id").notNull(),
	clinicId: uuid("clinic_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "fk_doctor_clinics_clinic_id"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "fk_doctor_clinics_doctor_id"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.doctorId, table.clinicId], name: "doctor_clinics_pkey"}),
	pgPolicy("Admins can manage platform data.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	pgPolicy("Anyone can view public data.", { as: "permissive", for: "select", to: ["public"] }),
]);

export const doctorServices = pgTable("doctor_services", {
	doctorId: uuid("doctor_id").notNull(),
	serviceId: uuid("service_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "fk_doctor_services_doctor_id"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.serviceId],
			foreignColumns: [services.id],
			name: "fk_doctor_services_service_id"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.doctorId, table.serviceId], name: "doctor_services_pkey"}),
	pgPolicy("Admins can manage platform data.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	pgPolicy("Anyone can view public data.", { as: "permissive", for: "select", to: ["public"] }),
]);

export const patientOrderItems = pgTable("patient_order_items", {
	orderId: uuid("order_id").notNull(),
	productId: uuid("product_id").notNull(),
	quantity: integer().notNull(),
	priceAtPurchase: numeric("price_at_purchase", { precision: 10, scale:  2 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [patientOrders.id],
			name: "fk_patient_order_items_order_id"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "fk_patient_order_items_product_id"
		}).onDelete("restrict"),
	primaryKey({ columns: [table.orderId, table.productId], name: "patient_order_items_pkey"}),
	pgPolicy("Admins can manage all patient-owned data.", { as: "permissive", for: "all", to: ["public"], using: sql`(get_my_role() = 'admin'::text)` }),
	pgPolicy("Patients can view their own order items.", { as: "permissive", for: "select", to: ["public"] }),
	check("patient_order_items_quantity_check", sql`quantity > 0`),
]);
