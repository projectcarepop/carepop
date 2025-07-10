import { pgTable, index, uuid, text, jsonb, boolean, timestamp, check, numeric, integer, date, pgEnum, customType, primaryKey, time } from "drizzle-orm/pg-core"
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
export const userRole = pgEnum("user_role", ['patient', 'admin', 'manager'])
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
	street: text("street"),
	barangayCode: text("barangay_code"),
	cityMunicipalityCode: text("city_municipality_code"),
	provinceCode: text("province_code"),
	zipCode: text("zip_code"),
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

export const doctorClinicServices = pgTable("doctor_clinic_services", {
	doctorId: uuid("doctor_id").notNull().references(() => doctors.id, { onDelete: 'cascade' }),
	clinicId: uuid("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
	serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.doctorId, table.clinicId, table.serviceId] }),
  };
});

export const doctorSchedules = pgTable("doctor_schedules", {
    id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
    doctorId: uuid("doctor_id").notNull().references(() => doctors.id, { onDelete: 'cascade' }),
    dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, etc.
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const clinicOverrides = pgTable("clinic_overrides", {
    id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
    clinicId: uuid("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
    startDateTime: timestamp("start_date_time", { withTimezone: true, mode: 'string' }).notNull(),
    endDateTime: timestamp("end_date_time", { withTimezone: true, mode: 'string' }).notNull(),
    reason: text("reason"),
    isAvailable: boolean("is_available").default(false).notNull(),
});

export const doctorAvailabilityOverrides = pgTable("doctor_availability_overrides", {
    id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
    doctorId: uuid("doctor_id").notNull().references(() => doctors.id, { onDelete: 'cascade' }),
    startDateTime: timestamp("start_date_time", { withTimezone: true, mode: 'string' }).notNull(),
    endDateTime: timestamp("end_date_time", { withTimezone: true, mode: 'string' }).notNull(),
    isAvailable: boolean("is_available").notNull(),
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
}, (table) => ({
    createdAtIdx: index("idx_profiles_created_at").on(table.createdAt),
}));

export const appointments = pgTable("appointments", {
	id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	patientId: uuid("patient_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
	doctorId: uuid("doctor_id").references(() => doctors.id, { onDelete: 'restrict' }),
	serviceId: uuid("service_id").notNull().references(() => services.id, { onDelete: 'restrict' }),
	clinicId: uuid("clinic_id").notNull().references(() => clinics.id, { onDelete: 'restrict' }),
	appointmentTime: timestamp("appointment_time", { withTimezone: true, mode: 'string' }).notNull(),
	status: appointmentStatus("status").default('scheduled').notNull(),
	reasonForVisit: text("reason_for_visit"),
	cancellationReason: text("cancellation_reason"),
	visitSummary: text("visit_summary"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
    patientIdx: index("idx_appointments_patient_id").on(table.patientId),
    doctorIdx: index("idx_appointments_doctor_id").on(table.doctorId),
    clinicIdx: index("idx_appointments_clinic_id").on(table.clinicId),
    appointmentTimeIdx: index("idx_appointments_appointment_time").on(table.appointmentTime),
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

export const inventory_items = pgTable("inventory_items", {
	id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	clinicId: uuid("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
	productCategoryId: uuid("product_category_id").references(() => productCategories.id, { onDelete: 'set null' }),
	itemName: text("item_name").notNull(),
	sku: text("sku").unique(),
	genericName: text("generic_name"),
	brandName: text("brand_name"),
	dosageForm: text("dosage_form"),
	strength: text("strength"),
	reorderLevel: integer("reorder_level").default(10).notNull(),
	purchasePrice: numeric("purchase_price", { precision: 10, scale:  2 }),
	sellingPrice: numeric("selling_price", { precision: 10, scale:  2 }),
	location: text("location"),
	quantityOnHand: integer("quantity_on_hand").default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
	clinicIdx: index("inventory_clinic_id_idx").on(table.clinicId),
	skuIdx: index("inventory_sku_idx").on(table.sku),
    quantityCheck: check("inventory_quantity_check", sql`"quantity_on_hand" >= 0`),
    reorderLevelCheck: check("inventory_reorder_level_check", sql`"reorder_level" >= 0`),
}));

export const auditChangeType = pgEnum("audit_change_type", ['initial_stock', 'manual_update', 'sale', 'return', 'spoilage', 'reconciliation', 'deletion']);

export const inventoryAuditLog = pgTable("inventory_audit_log", {
	id: uuid('id').default(sql`gen_random_uuid()`).primaryKey().notNull(),
	itemId: uuid("item_id").notNull().references(() => inventory_items.id, { onDelete: 'cascade' }),
	clinicId: uuid("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
	userId: uuid("user_id").notNull().references(() => usersInAuth.id, { onDelete: 'set null' }),
	changeType: auditChangeType("change_type").notNull(),
	quantityChange: integer("quantity_change").notNull(),
	oldQuantity: integer("old_quantity").notNull(),
	newQuantity: integer("new_quantity").notNull(),
	reason: text("reason"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
	itemIdx: index("audit_item_idx").on(table.itemId),
	clinicIdx: index("audit_clinic_idx").on(table.clinicId),
	userIdx: index("audit_user_idx").on(table.userId),
}));

export const inventoryItemBatches = pgTable('inventory_item_batches', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemId: uuid('item_id').notNull().references(() => inventory_items.id, { onDelete: 'cascade' }),
  batchNumber: text('batch_number'),
  quantity: integer('quantity').notNull(),
  expiryDate: timestamp('expiry_date', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const moodEnum = pgEnum("mood", ['happy', 'sad', 'neutral', 'anxious', 'stressed']);

export const healthLogs = pgTable("health_logs", {
	id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	patientId: uuid("patient_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
	logDate: date("log_date", { mode: 'string' }).notNull(),
	mood: moodEnum("mood"),
	symptoms: text("symptoms").array(),
	notes: text("notes"),
}, (table) => ({
    patientDateConstraint: index("health_logs_patient_id_log_date_key").on(table.patientId, table.logDate),
}));

export const menstrualLogs = pgTable("menstrual_logs", {
	id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	patientId: uuid("patient_id").notNull().references(() => profiles.id, { onDelete: 'cascade' } ),
	startDate: date("start_date", { mode: 'string' }).notNull(),
	endDate: date("end_date", { mode: 'string' }),
});


// --- RELATIONS ---

export const profilesRelations = relations(profiles, ({ many, one }) => ({
	appointments: many(appointments),
	reviews: many(reviews),
    healthLogs: many(healthLogs),
    menstrualLogs: many(menstrualLogs),
    user: one(usersInAuth, {
        fields: [profiles.id],
        references: [usersInAuth.id],
    })
}));

export const usersInAuthRelations = relations(usersInAuth, ({ one }) => ({
    profile: one(profiles),
}));

export const clinicsRelations = relations(clinics, ({ many }) => ({
	services: many(clinicServices),
	doctors: many(doctorClinics),
	appointments: many(appointments),
	inventoryItems: many(inventory_items),
    doctorClinicServices: many(doctorClinicServices),
}));

export const doctorsRelations = relations(doctors, ({ many }) => ({
	doctorClinics: many(doctorClinics),
	doctorClinicServices: many(doctorClinicServices),
    doctorSchedules: many(doctorSchedules),
    doctorAvailabilityOverrides: many(doctorAvailabilityOverrides),
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
	doctorClinicServices: many(doctorClinicServices),
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
	review: one(reviews, {
		fields: [appointments.id],
		references: [reviews.appointmentId]
	}),
    medicalRecords: many(medicalRecords),
}));

export const medicalRecordsRelations = relations(medicalRecords, ({ one }) => ({
  appointment: one(appointments, {
    fields: [medicalRecords.appointmentId],
    references: [appointments.id]
  }),
}));

export const recordDoctorNotesRelations = relations(recordDoctorNotes, ({ one }) => ({
    medicalRecord: one(medicalRecords, {
        fields: [recordDoctorNotes.recordId],
        references: [medicalRecords.id]
    }),
}));

export const recordPrescriptionsRelations = relations(recordPrescriptions, ({ one }) => ({
    medicalRecord: one(medicalRecords, {
        fields: [recordPrescriptions.recordId],
        references: [medicalRecords.id]
    }),
}));

export const recordDocumentsRelations = relations(recordDocuments, ({ one }) => ({
    medicalRecord: one(medicalRecords, {
        fields: [recordDocuments.recordId],
        references: [medicalRecords.id]
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

export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
    inventoryItems: many(inventory_items),
}));

export const inventory_itemsRelations = relations(inventory_items, ({ one, many }) => ({
	productCategory: one(productCategories, {
		fields: [inventory_items.productCategoryId],
		references: [productCategories.id]
	}),
	clinic: one(clinics, {
		fields: [inventory_items.clinicId],
		references: [clinics.id]
	}),
	auditLogs: many(inventoryAuditLog),
	batches: many(inventoryItemBatches),
}));

export const healthLogsRelations = relations(healthLogs, ({ one }) => ({
	patient: one(profiles, {
		fields: [healthLogs.patientId],
		references: [profiles.id]
	}),
}));

export const menstrualLogsRelations = relations(menstrualLogs, ({ one }) => ({
	patient: one(profiles, {
		fields: [menstrualLogs.patientId],
		references: [profiles.id]
	}),
}));

export const orders = pgTable("orders", {
	id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	patientId: uuid("patient_id").notNull().references(() => profiles.id, { onDelete: 'cascade' }),
	status: orderStatus("status").default('pending_payment').notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, () => ({
	totalAmountCheck: check("orders_total_amount_check", sql`"total_amount" >= 0`),
}));

export const orderItems = pgTable("order_items", {
	id: uuid('id').default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: 'cascade' }),
	inventoryItemId: uuid("inventory_item_id").notNull().references(() => inventory_items.id, { onDelete: 'restrict' }),
	quantity: integer("quantity").notNull(),
	priceAtTimeOfSale: numeric("price_at_time_of_sale", { precision: 10, scale:  2 }).notNull(),
}, () => ({
	quantityCheck: check("order_items_quantity_check", sql`quantity > 0`),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
	patient: one(profiles, {
		fields: [orders.patientId],
		references: [profiles.id]
	}),
	orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	inventoryItem: one(inventory_items, {
		fields: [orderItems.inventoryItemId],
		references: [inventory_items.id]
	}),
}));

export const inventoryAuditLogRelations = relations(inventoryAuditLog, ({ one }) => ({
    item: one(inventory_items, {
        fields: [inventoryAuditLog.itemId],
        references: [inventory_items.id]
    }),
    clinic: one(clinics, {
        fields: [inventoryAuditLog.clinicId],
        references: [clinics.id]
    }),
    user: one(profiles, {
        fields: [inventoryAuditLog.userId],
        references: [profiles.id]
    })
}));

export const inventoryItemBatchesRelations = relations(inventoryItemBatches, ({ one }) => ({
    item: one(inventory_items, {
        fields: [inventoryItemBatches.itemId],
        references: [inventory_items.id]
    })
}));

// Patient App Specific Relations

export const userProfilesRelations = relations(profiles, ({ many, one }) => ({
    appointments: many(appointments),
    reviews: many(reviews),
    healthLogs: many(healthLogs),
    menstrualLogs: many(menstrualLogs),
    user: one(usersInAuth, {
        fields: [profiles.id],
        references: [usersInAuth.id]
    })
}));

export const clinicServicesRelations = relations(clinicServices, ({ one }) => ({
	clinic: one(clinics, { fields: [clinicServices.clinicId], references: [clinics.id] }),
	service: one(services, { fields: [clinicServices.serviceId], references: [services.id] }),
}));

export const doctorClinicsRelations = relations(doctorClinics, ({ one }) => ({
	doctor: one(doctors, { fields: [doctorClinics.doctorId], references: [doctors.id] }),
	clinic: one(clinics, { fields: [doctorClinics.clinicId], references: [clinics.id] }),
}));

export const doctorClinicServicesRelations = relations(doctorClinicServices, ({ one }) => ({
	doctor: one(doctors, { fields: [doctorClinicServices.doctorId], references: [doctors.id] }),
	clinic: one(clinics, { fields: [doctorClinicServices.clinicId], references: [clinics.id] }),
	service: one(services, { fields: [doctorClinicServices.serviceId], references: [services.id] }),
}));

export const doctorSchedulesRelations = relations(doctorSchedules, ({ one }) => ({
    doctor: one(doctors, { fields: [doctorSchedules.doctorId], references: [doctors.id] }),
}));

export const serviceCategoriesRelations = relations(serviceCategories, ({ one, many }) => ({
	services: many(services),
}));

export const clinicOverridesRelations = relations(clinicOverrides, ({ one }) => ({
    clinic: one(clinics, { fields: [clinicOverrides.clinicId], references: [clinics.id] }),
}));

export const doctorAvailabilityOverridesRelations = relations(doctorAvailabilityOverrides, ({ one }) => ({
    doctor: one(doctors, { fields: [doctorAvailabilityOverrides.doctorId], references: [doctors.id] }),
}));