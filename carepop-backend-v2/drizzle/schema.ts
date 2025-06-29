import { pgTable, index, uuid, text, jsonb, boolean, timestamp, check, numeric, integer, date, pgEnum, customType, primaryKey } from "drizzle-orm/pg-core"
import { sql, relations } from "drizzle-orm"

// Placeholder for auth.users table
export const usersInAuth = pgTable("users", {
  id: uuid('id').primaryKey(),
}, () => ({
    tableName: "users",
    schemaName: "auth"
}));

export const appointmentStatus = pgEnum("appointment_status", ['scheduled', 'completed', 'canceled_by_patient', 'canceled_by_admin', 'no_show'])
export const medicalRecordType = pgEnum("medical_record_type", ['PRESCRIPTION', 'LAB_ORDER', 'DOCTOR_NOTE', 'LAB_RESULT', 'CLINICAL_DOCUMENT'])
export const orderStatus = pgEnum("order_status", ['pending_payment', 'processing', 'shipped', 'delivered', 'canceled'])
export const userRole = pgEnum("user_role", ['patient', 'admin'])
export const dayOfWeekEnum = pgEnum("day_of_week", [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
]);

const geographyPoint = customType<{ data: string }>({
    dataType() {
        return 'geography(Point, 4326)';
    },
});

export const clinics = pgTable("clinics", {
	id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text("name").notNull(),
	address: jsonb("address"),
	phoneNumber: text("phone_number"),
	logoUrl: text("logo_url"),
	location: geographyPoint("location"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
	locationIdx: index("clinics_location_idx").using("gist", table.location),
}));

export const doctors = pgTable("doctors", {
	id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	fullName: text("full_name").notNull(),
	specialtyText: text("specialty_text"),
	bio: text("bio"),
	avatarUrl: text("avatar_url"),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const serviceCategories = pgTable("service_categories", {
	id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text("name").notNull(),
	description: text("description"),
});

export const services = pgTable("services", {
	id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	categoryId: uuid("category_id").references(() => serviceCategories.id, { onDelete: 'set null' }),
	name: text("name").notNull(),
	description: text("description"),
	price: numeric("price", { precision: 10, scale:  2 }).notNull(),
	durationMinutes: integer("duration_minutes").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, () => ({
	priceCheck: check("services_price_check", sql`price >= 0`),
    durationCheck: check("services_duration_minutes_check", sql`duration_minutes > 0`),
}));

export const clinicServices = pgTable("clinic_services", {
	clinicId: uuid("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
	serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: 'cascade' }),
}, (table) => ({
	compoundKey: primaryKey({ columns: [table.clinicId, table.serviceId] }),
}));

export const doctorClinics = pgTable("doctor_clinics", {
	doctorId: uuid("doctor_id").notNull().references(() => doctors.id, { onDelete: 'cascade' }),
	clinicId: uuid("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
}, (table) => ({
	compoundKey: primaryKey({ columns: [table.doctorId, table.clinicId] }),
}));

export const doctorServices = pgTable("doctor_services", {
	doctorId: uuid("doctor_id").notNull().references(() => doctors.id, { onDelete: 'cascade' }),
	serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: 'cascade' }),
}, (table) => ({
	compoundKey: primaryKey({ columns: [table.doctorId, table.serviceId] }),
}));

export const providerAvailability = pgTable("provider_availability", {
    id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
    doctorId: uuid("doctor_id").notNull().references(() => doctors.id, { onDelete: 'cascade' }),
    dayOfWeek: dayOfWeekEnum("day_of_week").notNull(),
    startTime: text("start_time").notNull(), // "HH:MM:SS"
    endTime: text("end_time").notNull(),   // "HH:MM:SS"
});

export const profiles = pgTable("profiles", {
	id: uuid('id').primaryKey().notNull().references(() => usersInAuth.id, { onDelete: 'cascade' }),
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
	role: userRole("role").default('patient').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const appointments = pgTable("appointments", {
	id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	patientId: uuid("patient_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
	doctorId: uuid("doctor_id").notNull().references(() => doctors.id, { onDelete: 'restrict' }),
	serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: 'restrict' }),
	clinicId: uuid("clinic_id").notNull().references(() => clinics.id, { onDelete: 'restrict' }),
	appointmentTime: timestamp("appointment_time", { withTimezone: true, mode: 'string' }).notNull(),
	status: appointmentStatus("status").default('scheduled').notNull(),
	reasonForVisit: text("reason_for_visit"),
	visitSummary: text("visit_summary"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
    patientIdx: index("idx_appointments_patient_id").on(table.patientId),
    doctorIdx: index("idx_appointments_doctor_id").on(table.doctorId),
    clinicIdx: index("idx_appointments_clinic_id").on(table.clinicId),
}));

export const medicalRecords = pgTable("medical_records", {
	id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	appointmentId: uuid("appointment_id").notNull().references(() => appointments.id, { onDelete: 'cascade' }),
	recordType: medicalRecordType("record_type").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const recordDoctorNotes = pgTable("record_doctor_notes", {
    id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
    recordId: uuid("record_id").notNull().references(() => medicalRecords.id, { onDelete: 'cascade' }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const recordPrescriptions = pgTable("record_prescriptions", {
    id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
    recordId: uuid("record_id").notNull().references(() => medicalRecords.id, { onDelete: 'cascade' }),
    medication: text("medication").notNull(),
    dosage: text("dosage"),
    frequency: text("frequency"),
    startDate: date("start_date"),
    endDate: date("end_date"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const recordDocuments = pgTable("record_documents", {
    id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
    recordId: uuid("record_id").notNull().references(() => medicalRecords.id, { onDelete: 'cascade' }),
    documentName: text("document_name").notNull(),
    filePath: text("file_path").notNull(),
    fileType: text("file_type"),
    uploadedAt: timestamp("uploaded_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
	id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	appointmentId: uuid("appointment_id").notNull().unique().references(() => appointments.id, { onDelete: 'cascade' }),
	patientId: uuid("patient_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
	doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: 'set null' }),
	rating: integer("rating").notNull(),
	comment: text("comment"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, () => ({
    ratingCheck: check("reviews_rating_check", sql`rating >= 1 AND rating <= 5`),
}));

export const productCategories = pgTable("product_categories", {
	id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	name: text("name").notNull(),
	description: text("description"),
});

export const products = pgTable("products", {
	id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	categoryId: uuid("category_id").references(() => productCategories.id, { onDelete: 'set null' }),
	name: text("name").notNull(),
	description: text("description"),
	sku: text("sku").unique(),
	price: numeric("price", { precision: 10, scale:  2 }).notNull(),
	requiresPrescription: boolean("requires_prescription").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, () => ({
    priceCheck: check("products_price_check", sql`price >= 0`),
}));

export const inventory = pgTable("inventory", {
	productId: uuid("product_id").primaryKey().notNull().references(() => products.id, { onDelete: 'cascade' }),
	quantityOnHand: integer("quantity_on_hand").default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, () => ({
    quantityCheck: check("inventory_quantity_on_hand_check", sql`quantity_on_hand >= 0`),
}));


// --- RELATIONS ---

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

export const clinicsRelations = relations(clinics, ({ many }) => ({
	appointments: many(appointments),
	clinicServices: many(clinicServices),
}));

export const doctorsRelations = relations(doctors, ({ many }) => ({
	appointments: many(appointments),
	reviews: many(reviews),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
	serviceCategory: one(serviceCategories, {
		fields: [services.categoryId],
		references: [serviceCategories.id]
	}),
	appointments: many(appointments),
	clinicServices: many(clinicServices),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ many }) => ({
	services: many(services),
}));

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

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
	patient: one(profiles, {
		fields: [appointments.patientId],
		references: [profiles.id]
	}),
	doctor: one(doctors, {
		fields: [appointments.doctorId],
		references: [doctors.id]
	}),
	service: one(services, {
		fields: [appointments.serviceId],
		references: [services.id]
	}),
	clinic: one(clinics, {
		fields: [appointments.clinicId],
		references: [clinics.id]
	}),
	medicalRecords: many(medicalRecords),
	review: one(reviews),
}));

export const medicalRecordsRelations = relations(medicalRecords, ({ one }) => ({
	appointment: one(appointments, {
		fields: [medicalRecords.appointmentId],
		references: [appointments.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
	appointment: one(appointments, {
		fields: [reviews.appointmentId],
		references: [appointments.id]
	}),
	patient: one(profiles, {
		fields: [reviews.patientId],
		references: [profiles.id]
	}),
	doctor: one(doctors, {
		fields: [reviews.doctorId],
		references: [doctors.id]
	}),
}));

export const productsRelations = relations(products, ({ one }) => ({
	productCategory: one(productCategories, {
		fields: [products.categoryId],
		references: [productCategories.id]
	}),
	inventory: one(inventory),
}));

export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
	products: many(products),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
	product: one(products, {
		fields: [inventory.productId],
		references: [products.id]
	}),
}));
