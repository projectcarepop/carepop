ALTER TABLE "record_prescriptions" ADD COLUMN "linked_document_id" uuid;
DO $$ BEGIN
 ALTER TABLE "record_prescriptions" ADD CONSTRAINT "record_prescriptions_linked_document_id_medical_records_id_fk" FOREIGN KEY ("linked_document_id") REFERENCES "public"."medical_records"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$; 