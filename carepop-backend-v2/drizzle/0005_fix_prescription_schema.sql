-- This script is idempotent and can be run safely even if parts of the migration have already been applied.

-- Drop the foreign key constraint only if it exists
ALTER TABLE "record_prescriptions" DROP CONSTRAINT IF EXISTS "record_prescriptions_linked_document_id_medical_records_id_fk";

-- Drop the old column only if it exists
ALTER TABLE "record_prescriptions" DROP COLUMN IF EXISTS "linked_document_id";

-- Add the new columns only if they do not already exist
ALTER TABLE "record_prescriptions" ADD COLUMN IF NOT EXISTS "document_name" text;
ALTER TABLE "record_prescriptions" ADD COLUMN IF NOT EXISTS "file_path" text;
ALTER TABLE "record_prescriptions" ADD COLUMN IF NOT EXISTS "file_type" text;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow patients to download their own documents
CREATE POLICY "Allow patient to download their own medical documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-documents' AND
  auth.uid() IN (
    SELECT patient_id
    FROM public.appointments
    WHERE id = (storage.foldername(name))[1]::uuid
  )
); 