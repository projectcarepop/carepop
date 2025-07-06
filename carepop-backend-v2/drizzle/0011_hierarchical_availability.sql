-- Creating the new table for clinic-level overrides (holidays, closures, etc.)
CREATE TABLE IF NOT EXISTS "clinic_overrides" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    "clinic_id" uuid NOT NULL,
    "start_date_time" timestamp with time zone NOT NULL,
    "end_date_time" timestamp with time zone NOT NULL,
    "reason" text,
    "is_available" boolean DEFAULT false NOT NULL
);

-- Creating the new table for doctor-specific, one-off overrides (sick days, special sessions)
CREATE TABLE IF NOT EXISTS "doctor_availability_overrides" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    "doctor_id" uuid NOT NULL,
    "start_date_time" timestamp with time zone NOT NULL,
    "end_date_time" timestamp with time zone NOT NULL,
    "is_available" boolean NOT NULL
);

-- Setting up the foreign key constraints for the new tables
DO $$ BEGIN
 ALTER TABLE "clinic_overrides" ADD CONSTRAINT "clinic_overrides_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "doctor_availability_overrides" ADD CONSTRAINT "doctor_availability_overrides_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$; 