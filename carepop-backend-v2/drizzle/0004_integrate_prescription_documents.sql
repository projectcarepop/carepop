ALTER TABLE "record_prescriptions" DROP CONSTRAINT "record_prescriptions_linked_document_id_medical_records_id_fk";
ALTER TABLE "record_prescriptions" DROP COLUMN "linked_document_id";
ALTER TABLE "record_prescriptions" ADD COLUMN "document_name" text;
ALTER TABLE "record_prescriptions" ADD COLUMN "file_path" text;
ALTER TABLE "record_prescriptions" ADD COLUMN "file_type" text; 