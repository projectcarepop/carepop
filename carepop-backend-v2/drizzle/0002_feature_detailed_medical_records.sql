-- Alter the existing ENUM to add new record types.
-- Note: Using "IF NOT EXISTS" is good practice to avoid errors on re-runs.
ALTER TYPE "public"."medical_record_type" ADD VALUE IF NOT EXISTS 'LAB_RESULT';
ALTER TYPE "public"."medical_record_type" ADD VALUE IF NOT EXISTS 'CLINICAL_DOCUMENT';


-- Modify the primary medical_records table
-- Remove the generic 'details' column as it's being replaced by specialized tables.
ALTER TABLE "public"."medical_records" DROP COLUMN IF EXISTS "details";


-- Create the specialized table for DOCTOR_NOTE records
CREATE TABLE IF NOT EXISTS "public"."record_doctor_notes" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    "record_id" uuid NOT NULL,
    "note" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "public"."record_doctor_notes" ADD CONSTRAINT "record_doctor_notes_record_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."medical_records"("id") ON DELETE cascade ON UPDATE no action;


-- Create the specialized table for PRESCRIPTION records
CREATE TABLE IF NOT EXISTS "public"."record_prescriptions" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    "record_id" uuid NOT NULL,
    "medication" text NOT NULL,
    "dosage" text,
    "frequency" text,
    "start_date" date,
    "end_date" date,
    "notes" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "public"."record_prescriptions" ADD CONSTRAINT "record_prescriptions_record_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."medical_records"("id") ON DELETE cascade ON UPDATE no action;


-- Create the specialized table for document records (e.g., lab results, imaging)
CREATE TABLE IF NOT EXISTS "public"."record_documents" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    "record_id" uuid NOT NULL,
    "document_name" text NOT NULL,
    "file_path" text NOT NULL, -- This will store the path from Supabase Storage
    "file_type" text, -- e.g., 'application/pdf', 'image/jpeg'
    "uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "public"."record_documents" ADD CONSTRAINT "record_documents_record_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."medical_records"("id") ON DELETE cascade ON UPDATE no action; 