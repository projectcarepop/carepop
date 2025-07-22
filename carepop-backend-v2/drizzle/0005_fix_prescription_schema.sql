-- This script is idempotent and can be run safely even if parts of the migration have already been applied.

-- Drop the foreign key constraint only if it exists
ALTER TABLE "record_prescriptions" DROP CONSTRAINT IF EXISTS "record_prescriptions_linked_document_id_medical_records_id_fk";

-- Drop the old column only if it exists
ALTER TABLE "record_prescriptions" DROP COLUMN IF EXISTS "linked_document_id";

-- Add the new columns only if they do not already exist
ALTER TABLE "record_prescriptions" ADD COLUMN IF NOT EXISTS "document_name" text;
ALTER TABLE "record_prescriptions" ADD COLUMN IF NOT EXISTS "file_path" text;
ALTER TABLE "record_prescriptions" ADD COLUMN IF NOT EXISTS "file_type" text; 