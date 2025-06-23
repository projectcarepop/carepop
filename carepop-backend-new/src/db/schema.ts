import {
  pgTable,
  uuid,
  text,
  boolean,
  decimal,
  timestamp,
  integer,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============== ENUMS ==============
export const healthEntryTypeEnum = pgEnum('health_entry_type', ['pill', 'mood', 'menstrual_cycle']);

// ============== USERS & PROFILES ==============
// The `profiles` table is the core user data table, linked to Clerk.
export const profiles = pgTable('profiles', {
  // The new primary key is an independent, auto-generated UUID.
  id: uuid('id').primaryKey().defaultRandom(),
  // The `clerk_id` is the definitive link to the Clerk user record.
  clerkId: text('clerk_id').unique().notNull(),
  // The old Supabase Auth ID is kept for historical reference.
  supabaseAuthUserIdOld: text('supabase_auth_user_id_old'),

  // Personal Details
  firstName: text('first_name'),
  lastName: text('last_name'),
  middleInitial: text('middle_initial'),
  dateOfBirth: text('date_of_birth'),
  contactNo: text('contact_no'),
  avatarUrl: text('avatar_url'),
  genderIdentity: text('gender_identity'),
  pronouns: text('pronouns'),
  assignedSexAtBirth: text('assigned_sex_at_birth'),
  civilStatus: text('civil_status'),
  religion: text('religion'),
  occupation: text('occupation'),
  philhealthNo: text('philhealth_no'),
  street: text('street'),
  barangayCode: text('barangay_code'),
  cityMunicipalityCode: text('city_municipality_code'),
  provinceCode: text('province_code'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// The `providers` table extends a profile with professional details.
export const providers = pgTable('providers', {
  // Independent UUID primary key.
  id: uuid('id').primaryKey().defaultRandom(),
  // Foreign key linking back to the core profile.
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }),
  licenseNumber: text('license_number').unique(),
  bio: text('bio'),
  acceptingNewPatients: boolean('accepting_new_patients').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});


// ============== CLINICS ==============
export const clinics = pgTable('clinics', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  streetAddress: text('street_address'),
  locality: text('locality'),
  region: text('region'),
  postalCode: text('postal_code'),
  countryCode: text('country_code').default('PH'),
  latitude: decimal('latitude', { precision: 9, scale: 6 }),
  longitude: decimal('longitude', { precision: 9, scale: 6 }),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  operationDays: text('operation_days').array(),
  operationHours: text('operation_hours'),
  fpopChapterAffiliation: text('fpop_chapter_affiliation'),
  additionalNotes: text('additional_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});


// ============== JOIN TABLES ==============
export const clinicProviders = pgTable('clinic_providers', {
    clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
    providerId: uuid('provider_id').notNull().references(() => providers.id, { onDelete: 'cascade' }),
});

export const specializations = pgTable('specializations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  specializationId: uuid('specialization_id').references(() => specializations.id),
  price: decimal('price', { precision: 10, scale: 2 }),
  durationMinutes: integer('duration_minutes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const clinicServices = pgTable('clinic_services', {
    clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
});

export const providerServices = pgTable('provider_services', {
    providerId: uuid('provider_id').notNull().references(() => providers.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
});

export const providerAvailability = pgTable('provider_availability', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').notNull().references(() => providers.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0 for Sunday, 6 for Saturday
  startTime: text('start_time').notNull(), // "HH:MM" format
  endTime: text('end_time').notNull(), // "HH:MM" format
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const appointments = pgTable('appointments', {
    id: uuid('id').primaryKey().defaultRandom(),
    patientId: uuid('patient_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    providerId: uuid('provider_id').notNull().references(() => providers.id, { onDelete: 'cascade' }),
    clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }).notNull(),
    status: text('status').notNull().default('scheduled'), // e.g., scheduled, completed, cancelled
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============== HEALTH BUDDY ==============
export const health_entries = pgTable('health_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  entryType: healthEntryTypeEnum('entry_type').notNull(),
  status: text('status'),
  value: text('value'),
  details: jsonb('details'),
  entryDate: timestamp('entry_date', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ============== RELATIONS ==============

export const profilesRelations = relations(profiles, ({ one, many }) => ({
	providerInfo: one(providers, {
		fields: [profiles.id],
		references: [providers.profileId],
	}),
  appointmentsAsPatient: many(appointments),
  healthEntries: many(health_entries),
}));

export const providersRelations = relations(providers, ({ one, many }) => ({
	profile: one(profiles, {
		fields: [providers.profileId],
		references: [profiles.id],
	}),
  clinicProviders: many(clinicProviders),
  providerServices: many(providerServices),
  availability: many(providerAvailability),
  appointmentsAsProvider: many(appointments),
}));

export const clinicsRelations = relations(clinics, ({ many }) => ({
  clinicProviders: many(clinicProviders),
  clinicServices: many(clinicServices),
  appointments: many(appointments),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  specialization: one(specializations, {
    fields: [services.specializationId],
    references: [specializations.id],
  }),
  clinicServices: many(clinicServices),
  providerServices: many(providerServices),
  appointments: many(appointments),
}));

export const specializationsRelations = relations(specializations, ({ many }) => ({
  services: many(services),
}));

// --- Join Table Relations ---

export const clinicProvidersRelations = relations(clinicProviders, ({ one }) => ({
  clinic: one(clinics, {
    fields: [clinicProviders.clinicId],
    references: [clinics.id],
  }),
  provider: one(providers, {
    fields: [clinicProviders.providerId],
    references: [providers.id],
  }),
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

export const providerServicesRelations = relations(providerServices, ({ one }) => ({
  provider: one(providers, {
    fields: [providerServices.providerId],
    references: [providers.id],
  }),
  service: one(services, {
    fields: [providerServices.serviceId],
    references: [services.id],
  }),
}));

export const providerAvailabilityRelations = relations(providerAvailability, ({ one }) => ({
  provider: one(providers, {
    fields: [providerAvailability.providerId],
    references: [providers.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(profiles, {
    fields: [appointments.patientId],
    references: [profiles.id],
    relationName: 'appointments_as_patient'
  }),
  provider: one(providers, {
    fields: [appointments.providerId],
    references: [providers.id],
    relationName: 'appointments_as_provider'
  }),
  clinic: one(clinics, {
    fields: [appointments.clinicId],
    references: [clinics.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
}));

export const healthEntriesRelations = relations(health_entries, ({ one }) => ({
  user: one(profiles, {
    fields: [health_entries.userId],
    references: [profiles.id],
  }),
})); 