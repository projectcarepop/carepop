-- Dropping the old, unused provider_availability table if it exists
DROP TABLE IF EXISTS "provider_availability";

-- Creating the new doctor_schedules table based on the JSON specification
CREATE TABLE IF NOT EXISTS "doctor_schedules" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    "doctor_id" uuid NOT NULL,
    "day_of_week" integer NOT NULL,
    "start_time" time NOT NULL,
    "end_time" time NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Modifying the appointments table to make doctor_id nullable
ALTER TABLE "appointments" ALTER COLUMN "doctor_id" DROP NOT NULL;

-- Setting up the foreign key constraint for the new table
DO $$ BEGIN
 ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$; 